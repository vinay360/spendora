import { and, desc, eq, gte, lte, sum, count, sql } from "drizzle-orm"

import { db } from "@/db"
import { categories, transactions, budgets } from "@/db/schema"

export async function getDashboardData(userId: string) {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59)
  )

  const [recentTransactions, monthlyStatsResult, categoryStatsResult, totalBudgetsResult] = await Promise.all([
    // Recent Transactions
    db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        currency: transactions.currency,
        description: transactions.description,
        occurredAt: transactions.occurredAt,
        categoryName: categories.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.occurredAt, start),
          lte(transactions.occurredAt, end)
        )
      )
      .orderBy(desc(transactions.occurredAt))
      .limit(8),

    // Monthly Stats
    db
      .select({
        totalIncome: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
        totalSpend: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
        transactionCount: count(transactions.id),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.occurredAt, start),
          lte(transactions.occurredAt, end)
        )
      ),

    // Category Mix (Expense only)
    db
      .select({
        name: categories.name,
        amount: sum(transactions.amount).mapWith(Number),
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "expense"),
          gte(transactions.occurredAt, start),
          lte(transactions.occurredAt, end)
        )
      )
      .groupBy(categories.id, categories.name)
      .orderBy(desc(sum(transactions.amount))),

    // Total Budget usage
    db
      .select({
        totalBudget: sum(budgets.amount).mapWith(Number),
      })
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.month, now.getUTCMonth() + 1),
          eq(budgets.year, now.getUTCFullYear())
        )
      ),
  ])

  const stats = monthlyStatsResult[0] ?? { totalIncome: 0, totalSpend: 0, transactionCount: 0 }
  const totalBudget = totalBudgetsResult[0]?.totalBudget ?? 0
  
  // Calculate budget usage percentage
  let budgetUsage = 0
  if (totalBudget > 0) {
    budgetUsage = Math.round((Number(stats.totalSpend) / totalBudget) * 100)
  } else if (Number(stats.totalSpend) > 0) {
    budgetUsage = 100 // Over budget if no budget set but there's spend
  }

  // Calculate category mix share
  const totalCategorySpend = categoryStatsResult.reduce((acc, cat) => acc + (cat.amount || 0), 0)
  const categoryMix = categoryStatsResult.map(cat => ({
    name: cat.name || "Uncategorized",
    value: Number(cat.amount || 0),
    share: totalCategorySpend > 0 ? Math.round((Number(cat.amount || 0) / totalCategorySpend) * 100) : 0
  }))

  return {
    recentTransactions,
    monthlySpend: Number(stats.totalSpend),
    monthlyIncome: Number(stats.totalIncome),
    budgetUsage,
    transactionCount: stats.transactionCount,
    categoryMix
  }
}
