import { redirect } from "next/navigation"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarBlankIcon,
  ChartPieSliceIcon,
  ReceiptIcon,
  TargetIcon,
} from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getSession } from "@/lib/auth"
import { getDashboardData } from "@/server/queries/dashboard"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/sign-in")
  }

  const data = await getDashboardData(session.user.id)

  const stats = [
    { 
      label: "Monthly spend", 
      value: formatCurrency(data.monthlySpend), 
      detail: data.monthlySpend > 0 ? "Tracked expenses this month" : "No expenses recorded yet", 
      icon: ArrowDownIcon 
    },
    { 
      label: "Monthly income", 
      value: formatCurrency(data.monthlyIncome), 
      detail: data.monthlyIncome > 0 ? "Tracked income this month" : "Connect income entries", 
      icon: ArrowUpIcon 
    },
    { 
      label: "Budget usage", 
      value: `${data.budgetUsage}%`, 
      detail: data.budgetUsage > 0 ? "Of total monthly budget" : "Create your first budget", 
      icon: TargetIcon 
    },
    { 
      label: "Transactions", 
      value: data.transactionCount.toString(), 
      detail: data.transactionCount > 0 ? "Transactions recorded" : "Start by adding one expense", 
      icon: ReceiptIcon 
    },
  ]

  const hasTransactions = data.recentTransactions.length > 0
  const hasCategoryMix = data.categoryMix.length > 0

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <Badge className="w-fit" variant="secondary">
          <CalendarBlankIcon data-icon="inline-start" />
          Current month
        </Badge>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Financial command center
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Your authenticated workspace is ready. Add transactions and budgets
            next to turn this overview into live Neon-backed insight.
          </p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-2xl">{stat.value}</CardTitle>
              </div>
              <div className="flex size-9 items-center justify-center rounded-none bg-accent text-accent-foreground">
                <stat.icon weight="duotone" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{stat.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle>Recent transactions</CardTitle>
                <CardDescription>
                  {hasTransactions 
                    ? "Your latest transactions this month."
                    : "Server-scoped rows will appear here after your first write."}
                </CardDescription>
              </div>
              {!hasTransactions && <Badge variant="outline">Empty state</Badge>}
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
                {!hasTransactions ? (
                  <TableRow>
                    <TableCell className="font-medium">No transactions yet</TableCell>
                    <TableCell>Uncategorized</TableCell>
                    <TableCell>Today</TableCell>
                    <TableCell className="text-right">$0.00</TableCell>
                  </TableRow>
                ) : (
                  data.recentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.description}</TableCell>
                      <TableCell>{tx.categoryName || "Uncategorized"}</TableCell>
                      <TableCell>{formatDate(tx.occurredAt)}</TableCell>
                      <TableCell className={`text-right ${tx.type === 'expense' ? '' : 'text-emerald-600'}`}>
                        {tx.type === 'expense' ? '-' : '+'}{formatCurrency(Number(tx.amount))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card id="reports">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ChartPieSliceIcon className="text-primary" weight="duotone" />
              <CardTitle>Category mix</CardTitle>
            </div>
            <CardDescription>
              {hasCategoryMix 
                ? "Your top expense categories." 
                : "Default categories keep the first run understandable."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!hasCategoryMix ? (
              <>
                {[
                  { name: "Housing", value: "$0.00", share: "0%" },
                  { name: "Food", value: "$0.00", share: "0%" },
                  { name: "Transport", value: "$0.00", share: "0%" },
                  { name: "Subscriptions", value: "$0.00", share: "0%" },
                ].map((category) => (
                  <div className="flex flex-col gap-2" key={category.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-muted-foreground">{category.value}</span>
                    </div>
                    <div className="h-2 bg-muted">
                      <div className="h-full bg-primary" style={{ width: category.share }} />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              data.categoryMix.map((category) => (
                <div className="flex flex-col gap-2" key={category.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-muted-foreground">{formatCurrency(category.value)}</span>
                  </div>
                  <div className="h-2 bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${category.share}%` }} />
                  </div>
                </div>
              ))
            )}
            <Separator />
            <p className="text-sm text-muted-foreground">
              {hasCategoryMix
                ? "Showing distribution of expenses for the current month."
                : "Add expenses to calculate actual distribution and budget pressure."}
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
