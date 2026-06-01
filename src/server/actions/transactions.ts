"use server"

import { randomUUID } from "node:crypto"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { categories, transactions } from "@/db/schema"
import { getCurrentUser } from "@/lib/auth"
import { transactionSchema } from "@/lib/validations/finance"

export async function createTransaction(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const input = transactionSchema.parse({
    categoryId: formData.get("categoryId") || undefined,
    type: formData.get("type"),
    amount: formData.get("amount"),
    currency: formData.get("currency") || undefined,
    description: formData.get("description"),
    merchant: formData.get("merchant") || undefined,
    occurredAt: formData.get("occurredAt"),
  })

  if (input.categoryId) {
    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.id, input.categoryId), eq(categories.userId, user.id)))
      .limit(1)

    if (!category) {
      throw new Error("Invalid category")
    }
  }

  await db.insert(transactions).values({
    id: randomUUID(),
    userId: user.id,
    ...input,
    amount: input.amount.toFixed(2),
  })

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
}
