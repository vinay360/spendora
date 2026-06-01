import { betterAuth } from "better-auth/minimal"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { headers } from "next/headers"

import { db } from "@/db"
import * as schema from "@/db/schema"
import { env } from "@/lib/env"

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: env.BETTER_AUTH_SECRET ?? "development-only-secret-change-me",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: [nextCookies()],
})

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  })
}

export async function getCurrentUser() {
  const session = await getSession()

  return session?.user ?? null
}
