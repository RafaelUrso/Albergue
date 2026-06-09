# Decisions

## Phase 1: Setup & Infrastructure

### Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL via Prisma
- **i18n:** next-intl
- **Containerization:** Docker

### Project Structure
- Standard Next.js `src` directory structure.
- `[locale]` dynamic segment for i18n in `src/app`.

### Visual Theme
- Primary: Blue (#0055d4) and White (#ffffff).
- Secondary: Red (#e11d48) for highlights/alerts.

### Observations
- Using `next-intl` with standard App Router structure.
- Middleware handles locale detection and prefixing.
- Root page redirects to default locale.

## Phase 2: Auth & RBAC

### Authentication
- Using Auth.js (v5) with JWT strategy.
- Split configuration: `auth.config.ts` for Edge compatibility (used in Middleware) and `auth.ts` for the full configuration including the Prisma adapter and Credentials provider.

### Database (Prisma 7)
- Upgraded to Prisma 7 patterns: connection URL moved from `schema.prisma` to `prisma.config.ts`.
- Using `@prisma/adapter-pg` with `pg` pool to handle connections as required by the new configuration architecture.
- Configured idempotent database seeding using `tsx` in `prisma.config.ts`.
- Implemented `process.loadEnvFile()` in `prisma.config.ts` to ensure environment variables are loaded for Prisma CLI tools.

### Security
- Passwords hashed with `bcryptjs`.
- International passports encrypted using `AES-256-CBC` with a 32-character key from `ENCRYPTION_KEY` environment variable.
- Middleware-based RBAC protecting `/admin` and `/reception` routes.
- Immutable LGPD acceptance records stored in `AceiteTermos` table with timestamp and version.
