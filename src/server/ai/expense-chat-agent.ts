import { randomUUID } from "node:crypto"

import { and, desc, eq, gte } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { google } from "@ai-sdk/google"
import { InferAgentUIMessage, ToolLoopAgent, tool } from "ai"
import { z } from "zod"

import { db } from "@/db"
import { categories, transactions } from "@/db/schema"
import { normalizeExpenseDate } from "@/lib/date-normalizer"
import { transactionSchema } from "@/lib/validations/finance"

const confirmedExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().trim().min(2).max(160),
  occurredAt: z.string().describe("ISO date or datetime for the expense"),
  currency: z.string().trim().length(3).default("USD"),
  merchant: z.string().trim().max(120).optional(),
  categoryId: z.string().trim().min(1).optional(),
  categoryName: z.string().trim().min(1).optional(),
})

const confirmationOutputSchema = z.object({
  approved: z.boolean(),
  expense: confirmedExpenseSchema.optional(),
  note: z.string().optional(),
})

async function getUserCategories(userId: string) {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId))
}

async function resolveCategoryId({
  userId,
  categoryId,
  categoryName,
}: {
  userId: string
  categoryId?: string
  categoryName?: string
}) {
  if (categoryId) {
    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .limit(1)

    if (!category) {
      throw new Error("Invalid category")
    }

    return category.id
  }

  if (!categoryName) {
    return undefined
  }

  const userCategories = await getUserCategories(userId)
  const matchedCategory = userCategories.find(
    (category) => category.name.toLowerCase() === categoryName.toLowerCase()
  )

  return matchedCategory?.id
}

export function createExpenseChatAgent(userId: string) {
  const today = normalizeExpenseDate("today") ?? new Date().toISOString().slice(0, 10)
  const tools = {
    listCategories: tool({
      description: "List the user's available expense categories.",
      inputSchema: z.object({}),
      execute: async () => getUserCategories(userId),
    }),
    requestExpenseConfirmation: tool({
      description:
        "Ask the user to review, edit, and approve an expense draft before it is saved. Use this before addExpense.",
      inputSchema: z.object({
        amount: z.number().positive().optional(),
        description: z.string().trim().min(1).max(160).optional(),
        occurredAt: z
          .string()
          .optional()
          .describe("ISO date or datetime. If unknown, leave it blank."),
        currency: z.string().trim().length(3).default("USD"),
        merchant: z.string().trim().max(120).optional(),
        categoryId: z.string().trim().min(1).optional(),
        categoryName: z.string().trim().min(1).optional(),
      }),
      outputSchema: confirmationOutputSchema,
    }),
    addExpense: tool({
      description:
        "Save one approved expense after requestExpenseConfirmation returns approved=true with complete values.",
      inputSchema: confirmedExpenseSchema,
      execute: async (input) => {
        const occurredAt = normalizeExpenseDate(input.occurredAt) ?? input.occurredAt
        const categoryId = await resolveCategoryId({
          userId,
          categoryId: input.categoryId,
          categoryName: input.categoryName,
        })
        const expense = transactionSchema.parse({
          type: "expense",
          amount: input.amount,
          currency: input.currency,
          description: input.description,
          merchant: input.merchant,
          occurredAt,
          categoryId,
        })

        await db.insert(transactions).values({
          id: randomUUID(),
          userId,
          ...expense,
          amount: expense.amount.toFixed(2),
        })

        revalidatePath("/transactions")
        revalidatePath("/dashboard")

        return {
          saved: true,
          amount: expense.amount,
          description: expense.description,
          occurredAt: expense.occurredAt.toISOString(),
          categoryId,
        }
      },
    }),
    getExpenses: tool({
      description: "Retrieve the user's recent expenses.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(25).default(10),
        daysBack: z.number().int().min(1).max(366).optional(),
      }),
      execute: async ({ limit, daysBack }) => {
        const filters = [
          eq(transactions.userId, userId),
          eq(transactions.type, "expense"),
        ]

        if (daysBack) {
          const start = new Date()
          start.setDate(start.getDate() - daysBack)
          filters.push(gte(transactions.occurredAt, start))
        }

        return db
          .select({
            id: transactions.id,
            amount: transactions.amount,
            currency: transactions.currency,
            description: transactions.description,
            merchant: transactions.merchant,
            occurredAt: transactions.occurredAt,
            categoryName: categories.name,
          })
          .from(transactions)
          .leftJoin(categories, eq(transactions.categoryId, categories.id))
          .where(and(...filters))
          .orderBy(desc(transactions.occurredAt))
          .limit(limit)
      },
    }),
  }

  return new ToolLoopAgent({
    model: google("gemini-3.1-flash-lite-preview"),
    instructions: `You are Spendora's expense assistant.

You can help the user add and retrieve their own expenses.

Rules:
- Never save an expense until requestExpenseConfirmation has returned approved=true.
- If the user wants to add an expense, extract the likely fields and call requestExpenseConfirmation, even if some fields are missing.
- When calling requestExpenseConfirmation, include every expense field the user provided in the chat. Do not leave amount, description, merchant, date, currency, or category blank if the user stated it.
- If the user names a category that may not exist, still pass categoryName to requestExpenseConfirmation so the user can create and confirm it in the same dialog.
- Treat today's date as ${today} when the user says today.
- Prefer ISO dates for occurredAt. If the user gives a relative or natural-language date, pass that exact phrase in occurredAt so the app can normalize it before confirmation.
- Use USD unless the user gives another three-letter currency.
- If confirmation is denied, do not save the expense. Ask what should change.
- After confirmation is approved, call addExpense exactly once with the approved values.
- For retrieval requests, use getExpenses and summarize the result clearly.
- If a category is mentioned but you are unsure whether it exists, call listCategories before confirmation.`,
    tools,
  })
}

export type ExpenseChatUIMessage = InferAgentUIMessage<
  ReturnType<typeof createExpenseChatAgent>
>
