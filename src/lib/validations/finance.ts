import { z } from "zod"

const amountSchema = z.coerce
  .number()
  .positive("Amount must be greater than zero")
  .max(999999999.99, "Amount is too large")

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(48),
  icon: z.string().trim().min(1).max(48).default("Receipt"),
  color: z.string().trim().min(1).max(64).default("var(--chart-1)"),
})

export const transactionSchema = z.object({
  categoryId: z.string().trim().min(1).optional(),
  type: z.enum(["income", "expense"]),
  amount: amountSchema,
  currency: z.string().trim().length(3).default("USD"),
  description: z.string().trim().min(2).max(160),
  merchant: z.string().trim().max(120).optional(),
  occurredAt: z.coerce.date(),
})

export const budgetSchema = z.object({
  categoryId: z.string().trim().min(1),
  amount: amountSchema,
  currency: z.string().trim().length(3).default("USD"),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
})

export type CategoryInput = z.infer<typeof categorySchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type BudgetInput = z.infer<typeof budgetSchema>
