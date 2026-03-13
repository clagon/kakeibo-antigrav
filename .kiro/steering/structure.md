# Project Structure

## Organization Philosophy
Feature‑first with a clear separation between routes (pages & API) and library code (`src/lib`). Components are colocated with their routes when tightly coupled, otherwise stored in `src/lib/components`.

## Directory Patterns
### `src/routes/`
**Location**: `/src/routes/`
**Purpose**: SvelteKit pages and API endpoints.
**Example**: `+page.svelte`, `+server.ts`.

### `src/lib/`
**Location**: `/src/lib/`
**Purpose**: Reusable components, utilities, stores, types, and server logic.
**Example**: `components/`, `utils/`, `stores/`.

### `src/lib/components/`
**Location**: `/src/lib/components/`
**Purpose**: UI components (e.g., `CalendarGrid.svelte`, `Toast.svelte`).
**Example**: `components/calendar/MonthGrid.svelte`.

### `src/lib/utils/`
**Location**: `/src/lib/utils/`
**Purpose**: Pure helper functions.
**Example**: `format.ts`, `longpress.ts`.

## Naming Conventions
- **Files**: kebab-case (`month-grid.svelte`).
- **Components**: PascalCase (`MonthGrid.svelte`).
- **Functions**: camelCase.

## Import Organization
```ts
import { Something } from '$lib/utils/format';
import { LocalComponent } from './LocalComponent.svelte';
```
- Absolute imports use `$lib/` alias to `src/lib`.

## Path Aliases
- `$lib`: `src/lib/`
- `$routes`: `src/routes/`

## Code Organization Principles
- Small, focused components.
- Keep server logic in `+server.ts` files.
- Use SvelteKit's layout system for shared UI.
