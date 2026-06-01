"use client"

import { SignOutIcon } from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"

export function SignOutButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await signOut()
          router.push("/")
          router.refresh()
        })
      }}
      size="sm"
      variant="outline"
    >
      <SignOutIcon data-icon="inline-start" />
      Sign out
    </Button>
  )
}
