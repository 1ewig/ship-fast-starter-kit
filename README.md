# SaaS Starter Kit

A production-grade auth and profile system built with Next.js 16, Better Auth, Drizzle ORM, Supabase Storage, and shadcn/ui.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth | Better Auth v1.6 (email/password + OAuth) |
| Database | Drizzle ORM + Supabase PostgreSQL (Transaction Pooler) |
| Storage | Supabase Storage (avatars, service role key) |
| UI | shadcn/ui + Tailwind CSS v4 |
| State | Zustand |
| Email | Brevo SMTP API |
| Image Processing | Sharp (server-side WebP conversion) |
| Crop UI | react-easy-crop |

## Getting Started

```bash
bun install
cp .env.example .env.local
# Fill in your env vars (see Environment Variables below)
bun run dev
```

## Environment Variables

```bash
# Better Auth
BETTER_AUTH_SECRET=                  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Database (Supabase PostgreSQL)
DATABASE_URL=postgres://postgres:password@localhost:5432/saas_starter

# Supabase (required for avatar uploads)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=           # NEVER prefix with NEXT_PUBLIC_

# OAuth Providers (optional — leave blank to disable)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Email (optional — defaults to console logs in dev)
BREVO_API_KEY=
BREVO_SENDER_EMAIL=no-reply@yourdomain.com
BREVO_SENDER_NAME="SaaS Starter Kit"
```

## Database

Tables live in the `better_auth` PostgreSQL schema:

```bash
bun run db:push      # Push schema to database
bun run db:generate  # Generate migrations
bun run db:migrate   # Apply migrations
```

### Schema Overview

| Table | Purpose |
|-------|---------|
| `user` | User accounts with role, ban status, 2FA flag |
| `session` | Active sessions with IP, user agent, impersonation |
| `account` | OAuth + credential links per user |
| `verification` | Email verification + password reset tokens |
| `two_factor` | TOTP secrets and backup codes |
| `rate_limit` | Database-backed rate limiting (survives restarts) |

## Architecture

### 4-Layer Component Pattern

Every auth feature follows strict separation of concerns:

```
Page (server)  →  Container (client)  →  Hook (logic)  →  Presentational (UI)
```

| Layer | File Pattern | Responsibility |
|-------|-------------|---------------|
| Page | `src/app/**/page.tsx` | Server component, resolves providers, renders container |
| Container | `src/components/home/dashboard-client.tsx`, `src/components/profile/profile-layout-client.tsx` | Wires hooks to presentational components |
| Hook | `src/hooks/use*.ts` | State management, API calls, validation |
| Presentational | `src/components/auth/*.tsx`, `src/components/profile/*.tsx` | Pure UI, receives props only |

### File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── error/page.tsx
│   ├── settings/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── profile/page.tsx
│   │   ├── security/page.tsx
│   │   └── billing/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/           # Presentational auth components
│   ├── home/           # Dashboard components
│   ├── profile/        # Settings components
│   └── ui/             # Shared UI (shadcn)
├── hooks/              # Business logic hooks
├── lib/
│   ├── actions/        # Server actions
│   ├── auth.ts         # Server auth config
│   ├── auth-client.ts  # Client auth API
│   ├── auth-providers.ts
│   ├── dal.ts          # Data Access Layer
│   ├── email.ts        # Brevo SMTP integration
│   └── supabase.ts     # Supabase admin client
├── db/
│   ├── schema.ts       # Drizzle schema
│   └── index.ts        # Database client
└── stores/
    └── useHomeStore.ts  # Zustand store
```

## Features

### Authentication

- **Email/Password** — Sign in, sign up, forgot password, reset password
- **OAuth Providers** — GitHub, Google, Discord (dynamic — add new providers in 2 files)
- **Email Verification** — Required before sign-in, inline resend with 60s cooldown
- **Password Reset** — Separate `/forgot-password` and `/reset-password` pages
- **2FA** — TOTP-based two-factor authentication
- **Multi-Session** — Up to 5 concurrent sessions per user
- **Bearer Token** — API authentication for programmatic access
- **Admin** — Role-based access control (user/admin roles)

### Dashboard

- Welcome message with user's name
- Quick actions card linking to Profile, Security, and Billing settings

### Settings

- **Sidebar Navigation** — ShipFast branding, Profile/Security/Billing links, Sign Out button
- **Viewport-Locked Sidebar** — Sidebar stays fixed, only main content scrolls
- **Profile** — Avatar upload/delete, display name editing, social account management
- **Security** — Password, email, 2FA (placeholder)
- **Billing** — Payment, subscription (placeholder)

### Profile Management

- **Avatar Upload** — Crop → Sharp WebP → Supabase Storage → DB update → instant session refresh
- **Avatar Delete** — Confirmation dialog → storage cleanup → DB update
- **Display Name** — Inline editing with optimistic UI
- **Social Accounts** — Connect/disconnect OAuth providers with safety checks

### Security

- **Database-Backed Rate Limiting** — 5 sign-in attempts/10s, 3 sign-ups/10s, 2 verification resends/min
- **Account Linking** — Trusted providers only (GitHub), prevents cross-email takeover
- **Email Enumeration Protection** — Sacrificed for UX (every error has actionable next step)
- **DAL Session Guards** — `requireAuth()`, `requireAdmin()` with React cache deduplication
- **Service Role Isolation** — Supabase service role key used server-only, never exposed to client

## Custom Engineering (What Better Auth Doesn't Provide)

### 1. Pre-Signup Account Check

`check-account.ts` runs *before* sign-up/sign-in attempts. Returns a discriminated union:

```ts
| { exists: false }
| { exists: true; status: "verified" }
| { exists: true; status: "unverified" }
| { exists: true; status: "oauth_only"; provider: string }
| { exists: true; status: "banned" }
```

Powers provider-specific error messages and inline verification resend on both forms.

### 2. Dynamic Social Provider Detection

`getAvailableProviders()` detects configured OAuth providers from environment variables at runtime. Adding a new provider requires editing only 2 files:
1. `src/lib/auth.ts` — Add to `socialProviders`
2. `src/lib/auth-providers.ts` — Add env var mapping

Server pages resolve providers at request time and pass them as props — no API call needed.

### 3. Session Refresh After Server Updates

When the server updates `user.image`, `useSession()` doesn't automatically reflect the change. Fixed by calling `useSession().refetch()` (triggers React state update) + `router.refresh()` (busts RSC cache).

### 4. Avatar Upload Pipeline

Complete end-to-end pipeline:

1. Client validation (MIME, size)
2. Crop modal (react-easy-crop with zoom/pan)
3. Server re-validation (never trust client)
4. Sharp processing (256×256 WebP at 80% quality)
5. Supabase Storage upload
6. Old file cleanup
7. DB update via `auth.api.updateUser()`
8. Rollback on DB failure (delete uploaded file)
9. `revalidatePath("/")` for RSC cache invalidation
10. `useSession().refetch()` for instant UI update

### 5. Error Rollback

If `auth.api.updateUser()` fails after a successful storage upload, the uploaded file is immediately deleted to prevent orphaned files.

### 6. Singleton Patterns

Both the database client and Supabase admin client use `global.*` singletons to prevent connection leaks during Next.js dev hot-reload.

### 7. Typed Return Types

All server actions return discriminated unions instead of throwing:

```ts
type UploadAvatarResult =
  | { success: true; imageUrl: string }
  | { success: false; error: string; code: string };
```

Client hooks check `result.success` — TypeScript enforces exhaustive error handling.

### 8. DAL (Data Access Layer)

`requireAuth()` and `requireAdmin()` wrap `auth.api.getSession()` with React's `cache()` for request-level deduplication. Multiple calls in one request tree result in only 1 database query.

### 9. Verification Cooldown Persistence

Resend verification cooldown timer persists in `localStorage`. User navigates away and comes back — timer continues. Prevents spam-clicking.

### 10. Account Linking Security

```ts
account: {
  accountLinking: {
    enabled: true,
    trustedProviders: ["github"],  // Only GitHub auto-links
    allowDifferentEmails: false,   // Prevents cross-email takeover
  },
}
```

Plus a database hook that blocks OAuth sign-ups from unverified social emails.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Dashboard (protected) |
| `/settings` | Redirects to `/settings/profile` |
| `/settings/profile` | Avatar, display name, social accounts |
| `/settings/security` | Password, email, 2FA |
| `/settings/billing` | Payment, subscription |
| `/sign-in` | Sign in with email/password or OAuth |
| `/sign-up` | Create account with email verification |
| `/forgot-password` | Request password reset email |
| `/reset-password` | Set new password (from email link) |
| `/error` | Auth error page with typed error map |
| `/api/auth/*` | Better Auth API endpoints |

## Scripts

```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run start        # Start production server
bun run lint         # Run ESLint
bun run db:push      # Push schema to database
bun run db:generate  # Generate migrations
bun run db:migrate   # Apply migrations
```

## Supabase Storage Setup

Create the `avatars` bucket manually in the Supabase Dashboard:

1. Go to **Storage** → **New Bucket**
2. Name: `avatars`
3. Public bucket: **ON**
4. File size limit: `5242880` (5MB)
5. Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

## License

MIT
