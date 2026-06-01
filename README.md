# Spendora

A Next.js expense tracker built with shadcn/ui, Tailwind CSS, Better Auth, Drizzle ORM, and Neon Postgres.

## Stack

- Next.js App Router
- shadcn/ui with Tailwind CSS v4
- Better Auth with Google OAuth
- Drizzle ORM schema for Neon Postgres
- Zod validation for server mutations

## Setup

Create `.env` from `.env.example` and fill in the Neon and Google OAuth values.

```bash
bun install
bun run db:generate
bun run db:migrate
bun run dev
```

## Environment

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/spendora?sslmode=require"
BETTER_AUTH_SECRET="replace-with-a-long-random-secret"
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Google OAuth redirect URI for local development:

```txt
http://localhost:3000/api/auth/callback/google
```

## Scripts

- `bun run dev` starts local development.
- `bun run build` creates a production build.
- `bun run lint` runs ESLint.
- `bun run db:generate` creates Drizzle migrations.
- `bun run db:migrate` applies migrations to Neon.
- `bun run db:studio` opens Drizzle Studio.
