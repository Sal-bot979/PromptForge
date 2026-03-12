# PromptForge — Claude Code Conventions

This file is the orientation document for every Claude Code session on this project.
Read it before writing a single line of code. The codebase is the source of truth; this file
explains the decisions behind it.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15, App Router, TypeScript strict |
| Styling | Tailwind CSS v4 + shadcn/ui (dark theme) |
| Database | Supabase (PostgreSQL), typed via `src/types/database.ts` |
| Auth | Supabase Auth (magic link + OAuth) |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`), server-side only |
| Deployment | Vercel |

---

## Naming Conventions

### Files & Directories
- React components: `PascalCase.tsx` (`ForgeButton.tsx`, `ArtifactCard.tsx`)
- Utilities/services: `camelCase.ts` (`client.ts`, `compilePrompt.ts`)
- Route handlers: `route.ts` (Next.js convention)
- Types: `PascalCase` interfaces, `camelCase` for simple aliases
- Database columns: `snake_case` (Supabase convention, mirrored in TypeScript types)

### Components
- Forge design system components live in `src/components/forge/`
- shadcn generated components live in `src/components/ui/` — do not edit these manually
- Feature components (non-reusable) live in `src/components/features/`
- Co-locate tests: `ForgeButton.tsx` + `ForgeButton.test.tsx` in the same folder

### Variables & Functions
- Boolean variables: `is*`, `has*`, `can*` prefix (`isLoading`, `hasError`, `canGenerate`)
- Event handlers: `handle*` prefix (`handleSubmit`, `handleCopy`)
- Server actions: `*Action` suffix (`createProjectAction`, `deleteArtifactAction`)
- API routes: RESTful paths (`/api/generate`, `/api/projects/[id]/artifacts`)

---

## Server vs Client Split

This is the most important architectural rule. Violating it leaks secrets or breaks SSR.

### Server-only (never add `"use client"`)
- `src/lib/supabase/server.ts` — uses `cookies()`, runs on server
- `src/lib/claude/client.ts` — contains `ANTHROPIC_API_KEY`, never touches browser
- `src/app/api/**` — all Route Handlers run on server
- All Server Components by default (no directive needed)

### Client-required (`"use client"` needed)
- Any component using `useState`, `useEffect`, `useReducer`
- Any component with event handlers (`onClick`, `onChange`, `onSubmit`)
- Any component using browser APIs (`window`, `navigator`, `localStorage`)
- Zustand store providers

### Pattern: Data fetching
```typescript
// Server Component — fetch directly
async function DashboardPage() {
  const supabase = await createServerClient()
  const { data } = await supabase.from('projects').select('*')
  return <ProjectGrid projects={data ?? []} />
}

// Client Component — use passed props or SWR/React Query
"use client"
function ProjectGrid({ projects }: { projects: Project[] }) { ... }
```

---

## Supabase Rules

1. **Server client**: use `createServerClient()` from `src/lib/supabase/server.ts` in
   Server Components, Route Handlers, and Server Actions
2. **Browser client**: use `createBrowserClient()` from `src/lib/supabase/client.ts`
   only inside `"use client"` components
3. **RLS always on**: every table has Row Level Security enabled. Never disable RLS.
   Every policy uses `auth.uid() = user_id` or `auth.uid() = ANY(user_ids)`.
4. **Typed queries**: always use the generated types from `src/types/database.ts`.
   Run `supabase gen types typescript` after any schema change.
5. **Migrations**: all schema changes go in `supabase/migrations/` as numbered SQL files.
   Never modify the database directly through the Supabase dashboard for schema changes.

---

## Claude API Rules

1. **Server-side only**: `ANTHROPIC_API_KEY` must never appear in client bundles.
   All Claude calls go through Route Handlers (`src/app/api/`).
2. **Model**: always use `claude-sonnet-4-20250514` unless explicitly overridden.
3. **Streaming**: all generation endpoints return `ReadableStream` with
   `Content-Type: text/event-stream`. Never buffer a full response before sending.
4. **System prompts**: assembled by `compilePrompt()` in `src/lib/claude/prompts/`.
   Each artifact type has its own compiler function.
5. **Token budget**: include `max_tokens: 8192` on all calls. Log estimated input tokens
   in development.

---

## Error Handling

- **Never swallow errors silently.** Every `catch` block either re-throws or surfaces
  a user-facing message.
- API Route Handlers return structured JSON errors:
  ```typescript
  return NextResponse.json({ error: 'Descriptive message' }, { status: 400 })
  ```
- Client components display errors via toast (shadcn `useToast`) or inline error state.
- Use TypeScript's `never` exhaustive checks in switch statements on enums.
- Database errors: log full error in development, return generic "Something went wrong.
  Please try again." to the user in production.

---

## Styling Rules

1. Tailwind utilities only — no custom CSS files except `globals.css` for CSS custom properties.
2. Use CSS variables for all design tokens (defined in `globals.css`):
   ```css
   --color-accent: #e8ff47;
   --color-background: #0a0a0b;
   ```
3. Use the `cn()` helper from `src/lib/utils.ts` to merge classes conditionally.
4. Dark mode is structural — no `dark:` variants needed. The app is always dark.
5. Responsive breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).
   Design mobile-first.
6. shadcn components: override via `className` prop + `cn()`. Never edit files in
   `src/components/ui/` directly — re-run `shadcn add` to update.

---

## State Management

- **Server state** (database data): fetch in Server Components, pass as props. For
  client-side mutations, use Supabase browser client + optimistic updates.
- **UI state** (modals, tabs, transient UI): `useState` in the component that owns it.
  Lift state only when genuinely shared between siblings.
- **Global client state** (current project, active style profile, snippet library):
  Zustand store in `src/store/`. Keep stores small and focused.
- **Form state**: React Hook Form for all forms with user input.

---

## Commit Conventions

Format: `type(scope): description`

| Type | When |
|---|---|
| `feat` | New user-facing feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change with no behavior change |
| `test` | Adding or fixing tests |
| `chore` | Build system, dependencies, config |
| `style` | Formatting only |

Examples:
```
feat(intake): add guided step wizard for project description
fix(generate): handle Claude API timeout with user-facing retry
docs(claude): update conventions for style engine phase
chore(deps): bump anthropic SDK to 0.39.0
```

---

## Anti-Patterns

**Never do these:**

1. `process.env.ANTHROPIC_API_KEY` in any file that is or could be imported by a Client Component
2. `supabase.from('projects').select('*')` without a `.eq('user_id', userId)` filter
   (RLS handles this, but explicit filters prevent accidental data exposure if RLS is misconfigured)
3. `any` type — use `unknown` and narrow, or generate proper types
4. Calling `createServerClient()` inside a Client Component (it will throw at runtime)
5. Direct DOM manipulation — use React state and let React handle the DOM
6. `useEffect` for data fetching — use Server Components or SWR/React Query
7. Inline styles (`style={{}}`) — use Tailwind classes
8. `console.log` left in committed code — use a proper logger or remove before committing
9. Hardcoded user IDs, API keys, or URLs — use environment variables
10. Schema changes without a corresponding migration file

---

## Project Structure Reference

```
src/
  app/
    api/generate/route.ts     # Claude streaming endpoint
    (auth)/login/page.tsx     # Unauthenticated entry point
    (app)/
      layout.tsx              # Authenticated shell
      dashboard/page.tsx      # Project list
  components/
    ui/                       # shadcn (do not hand-edit)
    forge/                    # PromptForge design system
    features/                 # Feature-specific, non-reusable
  lib/
    supabase/                 # client.ts (browser), server.ts (server)
    claude/                   # client.ts, types.ts, prompts/
    utils.ts                  # cn() and shared helpers
  store/                      # Zustand stores
  types/
    database.ts               # Supabase-generated types
    index.ts                  # App type re-exports
supabase/
  migrations/                 # Numbered SQL migration files
  seed.sql                    # Starter data
docs/
  phases/                     # Phase scope + definition of done
  tasks/                      # Granular task checklists
```
