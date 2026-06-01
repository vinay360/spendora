"use server"

import { randomUUID } from "node:crypto"

import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { budgets } from "@/db/schema"
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

  await db.insert(budgets).values({
    id: randomUUID(),
    userId: user.id,
    ...input,
    amount: input.amount.toFixed(2),
  })

  revalidatePath("/budgets")
  revalidatePath("/dashboard")
}
