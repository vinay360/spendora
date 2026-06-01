import { redirect } from "next/navigation"

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { Logo } from "@/components/app/logo"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getSession } from "@/lib/auth"

export default async function SignInPage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="grid min-h-svh place-items-center bg-background px-6 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Logo className="justify-center" />
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign in to Spendora</CardTitle>
            <CardDescription>
              Use Google OAuth to keep your finance workspace secure and simple.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <GoogleSignInButton />
            <Separator />
            <p className="text-center text-sm text-muted-foreground">
              By continuing, you create a private workspace for your own
              categories, transactions, and budgets.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
