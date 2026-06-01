import { ChatCircleTextIcon } from "@phosphor-icons/react/dist/ssr"

import { ExpenseChat } from "@/components/app/expense-chat"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/auth"
import { getCategories } from "@/server/queries/categories"

export default async function ChatPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const categories = await getCategories(user.id)

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <Badge className="w-fit" variant="secondary">
          <ChatCircleTextIcon data-icon="inline-start" />
          Assistant
        </Badge>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Chat with Spendora
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Add expenses through natural language, review the extracted values,
            then approve the final entry before it is saved.
          </p>
        </div>
      </div>

      <ExpenseChat categories={categories} />
    </main>
  )
}
