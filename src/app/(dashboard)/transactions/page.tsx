import { CalendarBlankIcon, PlusIcon, ReceiptIcon } from "@phosphor-icons/react/dist/ssr"

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
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createTransaction } from "@/server/actions/transactions"
import { getCategories } from "@/server/queries/categories"
import { getTransactions } from "@/server/queries/transactions"
import { getCurrentUser } from "@/lib/auth"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

export default async function TransactionsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const [categories, transactions] = await Promise.all([
    getCategories(user.id),
    getTransactions(user.id),
  ])
  const today = new Date().toISOString().slice(0, 10)

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <Badge className="w-fit" variant="secondary">
          <ReceiptIcon data-icon="inline-start" />
          Expenses
        </Badge>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Transactions
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Add an expense now, then review every income or expense entry in one
            place.
          </p>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create expense</CardTitle>
            <CardDescription>
              Capture the amount, date, merchant, and optional category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createTransaction}>
              <input name="type" type="hidden" value="expense" />
              <input name="currency" type="hidden" value="USD" />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Input
                    id="description"
                    maxLength={160}
                    minLength={2}
                    name="description"
                    placeholder="Dinner with friends"
                    required
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="amount">Amount</FieldLabel>
                    <Input
                      id="amount"
                      inputMode="decimal"
                      min="0.01"
                      name="amount"
                      placeholder="48.20"
                      required
                      step="0.01"
                      type="number"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="occurredAt">Date</FieldLabel>
                    <Input
                      defaultValue={today}
                      id="occurredAt"
                      name="occurredAt"
                      required
                      type="date"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="merchant">Merchant</FieldLabel>
                  <Input
                    id="merchant"
                    maxLength={120}
                    name="merchant"
                    placeholder="Local Kitchen"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="categoryId">Category</FieldLabel>
                  <select
                    className="flex h-8 w-full rounded-none border border-input bg-transparent px-2.5 py-2 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={categories.length === 0}
                    id="categoryId"
                    name="categoryId"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 ? (
                    <FieldDescription>
                      Add categories later to classify this expense.
                    </FieldDescription>
                  ) : null}
                </Field>
                <Button type="submit">
                  <PlusIcon data-icon="inline-start" />
                  Add expense
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle>Recent transactions</CardTitle>
                <CardDescription>
                  New expenses appear here after submission.
                </CardDescription>
              </div>
              <Badge variant="outline">{transactions.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col gap-1">
                          <span>{transaction.description}</span>
                          {transaction.merchant ? (
                            <span className="text-xs text-muted-foreground">
                              {transaction.merchant}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.categoryName ?? "Uncategorized"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <CalendarBlankIcon data-icon="inline-start" />
                          {dateFormatter.format(transaction.occurredAt)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {transaction.type === "expense" ? "-" : "+"}
                        {currencyFormatter.format(Number(transaction.amount))}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="font-medium" colSpan={4}>
                      No transactions yet. Create your first expense to get
                      started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
