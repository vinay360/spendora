"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpIcon, CheckIcon, XIcon } from "@phosphor-icons/react"
import { useChat } from "@ai-sdk/react"
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { normalizeExpenseDate } from "@/lib/date-normalizer"
import { createCategoryFromChat } from "@/server/actions/categories"
import type { ExpenseChatUIMessage } from "@/server/ai/expense-chat-agent"

type CategoryOption = {
  id: string
  name: string
}

type ExpenseDraft = {
  amount: string
  createCategory: boolean
  description: string
  occurredAt: string
  currency: string
  merchant: string
  categoryId: string
  categoryName: string
}

function getText(message: ExpenseChatUIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("")
}

function ExpenseConfirmationDialog({
  part,
  categories,
  onConfirm,
  onCancel,
}: {
  part: Extract<
    ExpenseChatUIMessage["parts"][number],
    { type: "tool-requestExpenseConfirmation" }
  >
  categories: CategoryOption[]
  onConfirm: (toolCallId: string, draft: ExpenseDraft) => Promise<void>
  onCancel: (toolCallId: string) => void
}) {
  const today = normalizeExpenseDate("today") ?? new Date().toISOString().slice(0, 10)
  const initialDraft = useMemo<ExpenseDraft>(() => {
    const input = part.state === "input-available" ? part.input : undefined
    const normalizedOccurredAt = normalizeExpenseDate(input?.occurredAt)
    const matchedCategory = input?.categoryName
      ? categories.find(
        (category) =>
          category.name.toLowerCase() === input.categoryName?.toLowerCase()
      )
      : undefined

    return {
      amount: input?.amount ? String(input.amount) : "",
      createCategory: Boolean(input?.categoryName && !matchedCategory),
      description: input?.description ?? "",
      occurredAt: normalizedOccurredAt ?? (input?.occurredAt ? "" : today),
      currency: input?.currency ?? "USD",
      merchant: input?.merchant ?? "",
      categoryId: input?.categoryId ?? matchedCategory?.id ?? "",
      categoryName: input?.categoryName ?? "",
    }
  }, [categories, part, today])
  const [draft, setDraft] = useState(initialDraft)
  const [submitError, setSubmitError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const canCreateCategory = Boolean(draft.categoryName.trim() && !draft.categoryId)
  const isComplete =
    Number(draft.amount) > 0 && draft.description.trim().length >= 2 && draft.occurredAt

  if (part.state === "input-streaming") {
    return <Badge variant="outline">Preparing confirmation...</Badge>
  }

  if (part.state === "output-available") {
    return part.output.approved ? (
      <Badge variant="secondary">Expense approved</Badge>
    ) : (
      <Badge variant="outline">Expense not saved</Badge>
    )
  }

  if (part.state === "output-error") {
    return <Badge variant="outline">Confirmation failed: {part.errorText}</Badge>
  }

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Review expense before saving</DialogTitle>
          <DialogDescription>
            Edit anything the assistant missed or got wrong. The expense will only
            be saved after you approve it.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${part.toolCallId}-amount`}>Amount</FieldLabel>
              <Input
                id={`${part.toolCallId}-amount`}
                inputMode="decimal"
                min="0.01"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                required
                step="0.01"
                type="number"
                value={draft.amount}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${part.toolCallId}-date`}>Date</FieldLabel>
              <Input
                id={`${part.toolCallId}-date`}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    occurredAt: event.target.value,
                  }))
                }
                required
                type="date"
                value={draft.occurredAt}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor={`${part.toolCallId}-description`}>
              Description
            </FieldLabel>
            <Input
              id={`${part.toolCallId}-description`}
              maxLength={160}
              minLength={2}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              required
              value={draft.description}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${part.toolCallId}-merchant`}>
                Merchant
              </FieldLabel>
              <Input
                id={`${part.toolCallId}-merchant`}
                maxLength={120}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    merchant: event.target.value,
                  }))
                }
                value={draft.merchant}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${part.toolCallId}-currency`}>
                Currency
              </FieldLabel>
              <Input
                id={`${part.toolCallId}-currency`}
                maxLength={3}
                minLength={3}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    currency: event.target.value.toUpperCase(),
                  }))
                }
                required
                value={draft.currency}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor={`${part.toolCallId}-category`}>
              Category
            </FieldLabel>
            <select
              className="flex h-8 w-full rounded-none border border-input bg-transparent px-2.5 py-2 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
              id={`${part.toolCallId}-category`}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  categoryId: event.target.value,
                  createCategory: false,
                  categoryName:
                    categories.find(
                      (category) => category.id === event.target.value
                    )?.name ?? "",
                }))
              }
              value={draft.categoryId}
            >
              <option value="">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${part.toolCallId}-new-category`}>
              New category
            </FieldLabel>
            <Input
              id={`${part.toolCallId}-new-category`}
              maxLength={48}
              minLength={2}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  categoryId: "",
                  categoryName: event.target.value,
                  createCategory: event.target.value.trim().length >= 2,
                }))
              }
              placeholder="Create a category from this chat"
              value={draft.categoryId ? "" : draft.categoryName}
            />
          </Field>
          {canCreateCategory ? (
            <label
              className="flex items-start gap-2 text-xs text-muted-foreground"
              htmlFor={`${part.toolCallId}-create-category`}
            >
              <input
                checked={draft.createCategory}
                className="mt-0.5"
                id={`${part.toolCallId}-create-category`}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    createCategory: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              Create &quot;{draft.categoryName.trim()}&quot; and assign this expense to
              it when I approve.
            </label>
          ) : null}
        </FieldGroup>
        {submitError ? (
          <p className="text-xs text-destructive">{submitError}</p>
        ) : null}
        <DialogFooter>
          <Button
            disabled={isSubmitting}
            onClick={() => onCancel(part.toolCallId)}
            variant="outline"
          >
            <XIcon data-icon="inline-start" />
            Cancel
          </Button>
          <Button
            disabled={!isComplete || isSubmitting}
            onClick={async () => {
              setIsSubmitting(true)
              setSubmitError(undefined)
              try {
                await onConfirm(part.toolCallId, draft)
              } catch {
                setSubmitError("Could not create the category. Try again.")
                setIsSubmitting(false)
              }
            }}
          >
            <CheckIcon data-icon="inline-start" />
            {isSubmitting ? "Saving..." : "Approve and save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ExpenseChat({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter()
  const [availableCategories, setAvailableCategories] = useState(categories)
  const [input, setInput] = useState("")
  const { addToolOutput, error, messages, sendMessage, status } =
    useChat<ExpenseChatUIMessage>({
      transport: new DefaultChatTransport({ api: "/api/chat" }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      onFinish: () => router.refresh(),
    })

  async function confirmExpense(toolCallId: string, draft: ExpenseDraft) {
    let categoryId = draft.categoryId || undefined
    let categoryName = draft.categoryName.trim() || undefined

    if (!categoryId && draft.createCategory && categoryName) {
      const category = await createCategoryFromChat(categoryName)
      categoryId = category.id
      categoryName = category.name
      setAvailableCategories((current) =>
        current.some((item) => item.id === category.id)
          ? current
          : [...current, category]
      )
    }

    addToolOutput({
      tool: "requestExpenseConfirmation",
      toolCallId,
      output: {
        approved: true,
        expense: {
          amount: Number(draft.amount),
          description: draft.description.trim(),
          occurredAt: draft.occurredAt,
          currency: draft.currency.trim().toUpperCase(),
          merchant: draft.merchant.trim() || undefined,
          categoryId,
          categoryName,
        },
      },
    })
  }

  function cancelExpense(toolCallId: string) {
    addToolOutput({
      tool: "requestExpenseConfirmation",
      toolCallId,
      output: {
        approved: false,
        note: "The user canceled this expense confirmation.",
      },
    })
  }

  return (
    <Card className="min-h-[calc(100vh-10rem)]">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle>Expense chat</CardTitle>
          <CardDescription>
            Add expenses with approval, or ask for recent spending history.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-[34rem] flex-col gap-4">
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-none border bg-muted/20 p-3">
          {messages.length === 0 ? (
            <div className="grid flex-1 place-items-center text-center text-sm text-muted-foreground">
              Try “Add lunch at Chipotle for $14.32 today” or “Show my last 10
              expenses.”
            </div>
          ) : (
            messages.map((message) => {
              const text = getText(message)
              return (
                <div
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[85%] bg-primary px-3 py-2 text-xs/relaxed text-primary-foreground"
                      : "mr-auto max-w-[85%] border bg-background px-3 py-2 text-xs/relaxed"
                  }
                  key={message.id}
                >
                  {text ? <p className="whitespace-pre-wrap">{text}</p> : null}
                  <div className="mt-2 flex flex-col gap-2">
                    {message.parts.map((part) => {
                      if (part.type === "tool-requestExpenseConfirmation") {
                        return (
                          <ExpenseConfirmationDialog
                            categories={availableCategories}
                            key={`${part.toolCallId}-${part.state}`}
                            onCancel={cancelExpense}
                            onConfirm={confirmExpense}
                            part={part}
                          />
                        )
                      }

                      if (part.type === "tool-addExpense") {
                        if (part.state === "input-available") {
                          return (
                            <Badge key={part.toolCallId} variant="outline">
                              Saving expense...
                            </Badge>
                          )
                        }
                        if (part.state === "output-available") {
                          return (
                            <Badge key={part.toolCallId} variant="secondary">
                              Expense saved
                            </Badge>
                          )
                        }
                      }

                      if (part.type === "tool-getExpenses") {
                        if (part.state === "input-available") {
                          return (
                            <Badge key={part.toolCallId} variant="outline">
                              Fetching expenses...
                            </Badge>
                          )
                        }
                      }

                      return null
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {error ? (
          <p className="text-xs text-destructive">
            Something went wrong. Check your AI Gateway key and try again.
          </p>
        ) : null}

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (!input.trim()) {
              return
            }
            sendMessage({ text: input })
            setInput("")
          }}
        >
          <Textarea
            className="min-h-10 flex-1 resize-none"
            disabled={status === "submitted" || status === "streaming"}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            placeholder="Ask Spendora to add or retrieve expenses..."
            value={input}
          />
          <Button
            disabled={
              !input.trim() || status === "submitted" || status === "streaming"
            }
            type="submit"
          >
            <ArrowUpIcon data-icon="inline-start" />
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
