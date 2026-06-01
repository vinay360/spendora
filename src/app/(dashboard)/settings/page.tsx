import { GearSixIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <Badge className="w-fit" variant="secondary">
            <GearSixIcon data-icon="inline-start" />
            Google account
          </Badge>
          <CardTitle className="text-3xl">Settings</CardTitle>
          <CardDescription>
            Manage profile preferences and future finance workspace defaults.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  )
}
