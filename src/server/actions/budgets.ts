"use server"

import { randomUUID } from "node:crypto"

import { revalidatePath } from "next/cache"

import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import { budgets, categories } from "@/db/schema"
import { getCurrentUser } from "@/lib/auth"
import { budgetSchema } from "@/lib/validations/finance"

export async function createBudget(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const input = budgetSchema.parse({
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    currency: formData.get("currency") || undefined,
    month: formData.get("month"),
    year: formData.get("year"),
  })


  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, input.categoryId), eq(categories.userId, user.id)))
    .limit(1)

  if (!category) {
    throw new Error("Invalid category")
  }

  await db.insert(budgets).values({
    id: randomUUID(),
    userId: user.id,
    ...input,
    amount: input.amount.toFixed(2),
  })

  revalidatePath("/budgets")
  revalidatePath("/dashboard")
}
