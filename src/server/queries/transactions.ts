import { desc, eq } from "drizzle-orm"

import { db } from "@/db"
import { categories, transactions } from "@/db/schema"

export async function getTransactions(userId: string) {
  return db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      currency: transactions.currency,
      description: transactions.description,
      merchant: transactions.merchant,
      occurredAt: transactions.occurredAt,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.occurredAt))
}
