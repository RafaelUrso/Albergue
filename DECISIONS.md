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
