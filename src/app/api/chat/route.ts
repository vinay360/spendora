import { createAgentUIStreamResponse, smoothStream, type UIMessage } from "ai"

import { getCurrentUser } from "@/lib/auth"
import { createExpenseChatAgent } from "@/server/ai/expense-chat-agent"

export const maxDuration = 30

export async function POST(request: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { messages }: { messages: UIMessage[] } = await request.json()

  return createAgentUIStreamResponse({
    agent: createExpenseChatAgent(user.id),
    experimental_transform: smoothStream({ chunking: "word" }),
    uiMessages: messages,
  })
}
