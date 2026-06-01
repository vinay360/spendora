import { WalletIcon } from "@phosphor-icons/react/dist/ssr"

import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex size-8 items-center justify-center rounded-none bg-primary text-primary-foreground">
        <WalletIcon weight="duotone" />
      </div>
      <span className="font-heading text-lg font-semibold tracking-tight">
        Spendora
      </span>
    </div>
  )
}
