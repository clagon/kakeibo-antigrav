# Technology Stack

## Architecture
SvelteKit（Vite）をフロントエンドに採用し、Server Actions と API Routes でバックエンドロジックを実装。TypeScript と Drizzle ORM を使い型安全なデータアクセスを実現。PostgreSQL をローカル Docker Compose で構築し、CI には GitHub Actions を利用。

## Core Technologies
- **Language**: TypeScript
- **Framework**: SvelteKit 5
- **Runtime**: Node.js 22+
- **UI**: Svelte + Tailwind CSS 4
- **Charts**: Chart.js 4
- **ORM**: Drizzle ORM 0.45
- **Database**: PostgreSQL

## Key Libraries
- ESLint v9 + Prettier v3 + eslint-config-prettier
- Vitest for unit tests, Playwright for E2E
- Lucide Svelte for icons
- date-fns for date manipulation

## Development Standards
### Type Safety
Strict mode enabled (`"strict": true`), no `any` usage.

### Code Quality
ESLint + Prettier + Tailwind CSS plugin. Lint runs via `npm run lint`.

### Testing
- Unit tests with Vitest (`npm test:unit`).
- E2E tests with Playwright (`npm test`).

## Development Environment
### Required Tools
- Node.js 22+
- Docker Compose (for PostgreSQL)
- npm

### Common Commands
```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Test
npm test
```

## Key Technical Decisions
- Server Actions for simple state updates to reduce API surface.
- Drizzle ORM for type-safe SQL queries.
- SvelteKit API Routes for more complex endpoints.
- PWA manifest for offline support.
