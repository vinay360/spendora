<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Spendora Agent Guide

## Project Overview

Spendora is a personal finance app built with Next.js App Router, React, Drizzle ORM, Neon Postgres, Better Auth, shadcn-style UI components, and the Vercel AI SDK.

Core product areas:

- Dashboard summaries and reports
- Transactions and expenses
- Categories
- Budgets
- AI expense chat with editable confirmation before saving

## Commands

- Install dependencies: `bun install`
- Start development server: `bun run dev`
- Build: `bun run build`
- Lint: `bun run lint`
- Generate Drizzle migrations: `bun run db:generate`
- Run Drizzle migrations: `bun run db:migrate`
- Open Drizzle Studio: `bun run db:studio`

## Environment

Use `.env.example` as the source of required environment variables.

Important server-side variables:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_GENERATIVE_AI_API_KEY`

Do not commit real secrets or local `.env` files.

## Architecture

- App routes live in `src/app`.
- Dashboard pages live in `src/app/(dashboard)`.
- Auth pages live in `src/app/(auth)`.
- Server actions live in `src/server/actions`.
- Server queries live in `src/server/queries`.
- AI agent code lives in `src/server/ai`.
- Database schema lives in `src/db/schema`.
- Shared validation schemas live in `src/lib/validations`.
- Reusable app components live in `src/components/app`.
- UI primitives live in `src/components/ui`.

## Coding Guidelines

- Prefer small, focused changes.
- Keep server-only database and auth logic out of client components.
- Use existing validation schemas before adding new ones.
- Use Drizzle query builders for database access.
- Scope all finance data by authenticated `user.id`.
- Preserve the existing UI style: compact, squared controls, muted surfaces, and shadcn-style primitives.
- Run `bun run lint` and `bun run build` after meaningful code changes.

## Auth And Data Access

- Use `getCurrentUser()` or `getSession()` from `src/lib/auth.ts` for authenticated server code.
- Return early or reject requests when no user is present.
- Never query transactions, categories, or budgets without filtering by the current user.
- Validate category ownership before assigning a category to a transaction or budget.

## AI Expense Chat

The chat feature uses AI SDK `ToolLoopAgent` with the Google provider.

Relevant files:

- `src/server/ai/expense-chat-agent.ts`
- `src/app/api/chat/route.ts`
- `src/components/app/expense-chat.tsx`
- `src/app/(dashboard)/chat/page.tsx`

Rules for AI expense changes:

- The agent must not save an expense until the user approves the editable confirmation dialog.
- The confirmation tool should collect or display missing fields before save.
- The final save must happen through the authenticated server-side tool.
- Keep all database writes server-side.
- Use `GOOGLE_GENERATIVE_AI_API_KEY` for Gemini access through `@ai-sdk/google`.

## Next.js Notes

- This project uses Next.js 16. Read local docs in `node_modules/next/dist/docs/` before changing route handlers, server actions, caching, or app-router conventions.
- Route handlers use Web `Request` and `Response` APIs.
- Keep client components marked with `"use client"` only when interactivity is required.

## Database Notes

- Drizzle schema is the source of truth for database shape.
- Add migrations when schema changes.
- Do not manually edit generated migration snapshots unless there is a clear migration repair task.
