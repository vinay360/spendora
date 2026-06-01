"use server"

import { randomUUID } from "node:crypto"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"

import { db } from "@/db"
import { categories } from "@/db/schema"
import { getCurrentUser } from "@/lib/auth"
import { categorySchema } from "@/lib/validations/finance"

function optionalText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined
  }

  return value.trim() || undefined
}

function revalidateCategoryViews() {
  revalidatePath("/categories")
  revalidatePath("/transactions")
  revalidatePath("/budgets")
  revalidatePath("/dashboard")
}

export async function createCategory(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const input = categorySchema.parse({
    name: formData.get("name"),
    icon: optionalText(formData.get("icon")),
    color: optionalText(formData.get("color")),
  })

  await db.insert(categories).values({
    id: randomUUID(),
    userId: user.id,
    ...input,
  })

  revalidateCategoryViews()
}

export async function updateCategory(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const id = formData.get("id")

  if (typeof id !== "string" || id.trim().length === 0) {
    throw new Error("Category id is required")
  }

  const input = categorySchema.parse({
    name: formData.get("name"),
    icon: optionalText(formData.get("icon")),
    color: optionalText(formData.get("color")),
  })

  await db
    .update(categories)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(categories.id, id), eq(categories.userId, user.id)))

  revalidateCategoryViews()
}
