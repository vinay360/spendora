import { TargetIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function BudgetsPage() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <Badge className="w-fit" variant="secondary">
            <TargetIcon data-icon="inline-start" />
            Coming next
          </Badge>
          <CardTitle className="text-3xl">Budgets</CardTitle>
          <CardDescription>
            Set monthly category limits and compare actual spend against plan.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  )
}
