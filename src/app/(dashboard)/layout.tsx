import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/app/app-sidebar"
import { SignOutButton } from "@/components/app/sign-out-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getSession } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession()

  if (!session) {
    redirect("/sign-in")
  }

  const initials = session.user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <Separator className="h-5" orientation="vertical" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Spendora workspace</span>
              <span className="text-xs text-muted-foreground">
                Track, budget, and review with intent.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              {session.user.image ? (
                <AvatarImage alt={session.user.name} src={session.user.image} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <SignOutButton />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
