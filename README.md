# SaaS Starter Kit

A modern SaaS starter built with Next.js 16, Better Auth, Drizzle ORM, Supabase, Polar, and shadcn/ui.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Auth:** Better Auth (email/password + GitHub OAuth)
- **Database:** Drizzle ORM + Supabase PostgreSQL
- **Payments:** Polar
- **UI:** shadcn/ui + Tailwind CSS v4
- **State:** Zustand
- **Validation:** Zod

## Getting Started

```bash
bun install
cp .env.example .env.local
# Fill in your env vars
bun run dev
```

## Database

Tables live in the `better_auth` schema:

```bash
bun run db:push   # Push schema to database
bun run db:generate # Generate migrations
bun run db:migrate  # Apply migrations
```

## Auth

- Sign in: `/sign-in`
- Sign up: `/sign-up`
- Auth API: `/api/auth/*`
