"use client"

import { GoogleLogoIcon } from "@phosphor-icons/react"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { signIn } from "@/lib/auth-client"

export function GoogleSignInButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      className="w-full"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await signIn.social({
            provider: "google",
            callbackURL: "/dashboard",
          })
        })
      }}
      size="lg"
      type="button"
    >
      <GoogleLogoIcon data-icon="inline-start" />
      {isPending ? "Opening Google..." : "Continue with Google"}
    </Button>
  )
}
