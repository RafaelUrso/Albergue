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

### Security
- Passwords hashed with `bcryptjs`.
- International passports encrypted using `AES-256-CBC` with a 32-character key from `ENCRYPTION_KEY` environment variable.
- Middleware-based RBAC protecting `/admin` and `/reception` routes.
- Immutable LGPD acceptance records stored in `AceiteTermos` table with timestamp and version.

## Phase 3: Physical Structure

### Database & Seed
- Updated `QuartoTipo` to A, B, C to match business requirements.
- Implemented `prisma/seed.ts` with comprehensive sample data for rooms, beds, tariffs, and an admin user.
- **Note:** Due to the absence of a reachable PostgreSQL service in the sandbox environment and Docker pull rate limits, `npx prisma db seed` and `npx prisma migrate dev` could not be executed during implementation. Validation of migrations and seeding must be performed in a local environment with a working database.
- Database URL is managed through `prisma.config.ts` (Prisma 7) and environment variables.

### Visual Map
- Initial version of the hostel map implemented as an SVG component in `src/app/[locale]/map/page.tsx`.
- Map includes Rooms 101 (A), 102 (B), 103 (C), common areas (Kitchen, Laundry, Refectory), and bathroom distinctions.
