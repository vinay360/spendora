import { asc, eq } from "drizzle-orm"

import { db } from "@/db"
import { categories } from "@/db/schema"

export async function getCategories(userId: string) {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      icon: categories.icon,
      color: categories.color,
    })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.name))
}
