# Phase 1: Foundation & Architecture

## Goal

Establish the complete technical foundation: working Next.js project with Supabase wired up, design
system established, database schema defined, core components built, Claude API streaming client
implemented, and CI skeleton running.

## Scope

- Next.js 15 (App Router, TypeScript) project initialized
- Tailwind CSS v4 + shadcn/ui configured with dark theme
- Supabase client setup (browser + server) with auth middleware
- PostgreSQL schema: projects, artifacts, style_profiles, snippets, generation_history
- Design system: color tokens, typography, 5 Forge base components
- Claude API streaming client (server-side only, AsyncThrowingStream pattern via ReadableStream)
- GitHub Actions CI: build + lint on every push/PR
- CLAUDE.md conventions document at repo root

## Non-Goals

- No AI generation logic (Phase 3)
- No project intake form (Phase 2)
- No real Supabase project connected — schema file only, .env.example provided
- No deployment to Vercel (Phase 10)
- No authentication UI polish (Phase 9)

## Deliverables

| File | Purpose |
|---|---|
| `package.json` | All dependencies declared |
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Dark theme + accent color tokens |
| `components.json` | shadcn/ui configuration |
| `tsconfig.json` | Strict TypeScript |
| `src/app/layout.tsx` | Root layout with dark background |
| `src/app/page.tsx` | Landing page / auth redirect |
| `src/app/(auth)/login/page.tsx` | Login page skeleton |
| `src/app/(app)/layout.tsx` | Authenticated app shell |
| `src/app/(app)/dashboard/page.tsx` | Dashboard skeleton |
| `src/app/api/generate/route.ts` | Streaming Claude API route |
| `src/components/forge/` | 5 base components |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server Supabase client |
| `src/lib/claude/client.ts` | Claude streaming utility |
| `src/types/database.ts` | Supabase table types |
| `supabase/migrations/001_initial_schema.sql` | Full database schema |
| `CLAUDE.md` | Conventions + patterns |
| `.github/workflows/ci.yml` | CI pipeline |

## Definition of Done

- [ ] `npm run build` exits 0 with zero TypeScript errors
- [ ] Root page renders with `#0a0a0b` background and `#e8ff47` accent visible
- [ ] Supabase migration SQL parses without syntax errors
- [ ] Auth middleware redirects unauthenticated users to `/login`
- [ ] `/api/generate` returns a streaming response to a test POST
- [ ] All 5 Forge components render in the dashboard without errors
- [ ] `CLAUDE.md` present and complete
- [ ] `docs/phases/PHASE_1_FOUNDATION.md` + `docs/tasks/PHASE_1_TASKS.md` exist
- [ ] `.github/workflows/ci.yml` is syntactically valid YAML
- [ ] Commit `feat: initialize PromptForge with Next.js + Supabase foundation` pushed to `claude/build-promptforge-app-wumtR`
