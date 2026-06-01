import {
  ChatCircleTextIcon,
  ChartDonutIcon,
  GearSixIcon,
  HouseIcon,
  ReceiptIcon,
  TargetIcon,
  TagIcon,
} from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

import { Logo } from "@/components/app/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { User } from "@/db/schema"

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: HouseIcon },
  { title: "Chat", href: "/chat", icon: ChatCircleTextIcon },
  { title: "Transactions", href: "/transactions", icon: ReceiptIcon },
  { title: "Categories", href: "/categories", icon: TagIcon },
  { title: "Budgets", href: "/budgets", icon: TargetIcon },
  { title: "Reports", href: "/dashboard#reports", icon: ChartDonutIcon },
  { title: "Settings", href: "/settings", icon: GearSixIcon },
]

export function AppSidebar({ user }: { user: Pick<User, "name" | "email"> }) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex min-w-0 flex-col gap-1 px-2 py-1 text-xs">
          <span className="truncate font-medium">{user.name}</span>
          <span className="truncate text-muted-foreground">{user.email}</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
