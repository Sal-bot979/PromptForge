# Phase 1 Tasks: Foundation & Architecture

All tasks are independently verifiable. Mark complete only when the item works, not when code exists.

## 1. Documentation First

- [x] 1.1 Create `docs/phases/PHASE_1_FOUNDATION.md` with scope + definition of done
- [x] 1.2 Create `docs/tasks/PHASE_1_TASKS.md` (this file)

## 2. CLAUDE.md

- [ ] 2.1 Write `CLAUDE.md` at repo root covering: naming conventions, server/client split rules,
        Supabase usage patterns, Claude API rules, error handling standards, commit conventions

## 3. Project Configuration

- [ ] 3.1 Create `package.json` with all Phase 1 dependencies
- [ ] 3.2 Create `next.config.ts`
- [ ] 3.3 Create `tsconfig.json` (strict mode)
- [ ] 3.4 Create `tailwind.config.ts` with dark theme and custom tokens
- [ ] 3.5 Create `components.json` for shadcn/ui (dark slate base)
- [ ] 3.6 Create `.gitignore` (Node, Next.js, .env, OS files)
- [ ] 3.7 Create `.env.example` with all required environment variables

## 4. GitHub Actions CI

- [ ] 4.1 Create `.github/workflows/ci.yml` — build + lint on push and PR to any branch

## 5. Database Schema

- [ ] 5.1 Create `supabase/migrations/001_initial_schema.sql`:
        - artifact_type enum (10 values)
        - style_type enum (4 values)
        - projects table with RLS
        - artifacts table with RLS
        - style_profiles table with RLS
        - snippets table with RLS
        - generation_history table with RLS
- [ ] 5.2 Create `supabase/seed.sql` with 20 starter snippets

## 6. TypeScript Types

- [ ] 6.1 Create `src/types/database.ts` — typed interfaces for all Supabase tables
- [ ] 6.2 Create `src/types/index.ts` — re-export + app-level type aliases

## 7. Supabase Clients

- [ ] 7.1 Create `src/lib/supabase/client.ts` — browser singleton client
- [ ] 7.2 Create `src/lib/supabase/server.ts` — server client using cookies
- [ ] 7.3 Create `src/middleware.ts` — session refresh + auth redirect logic

## 8. Claude API Client

- [ ] 8.1 Create `src/lib/claude/types.ts` — request/response types
- [ ] 8.2 Create `src/lib/claude/client.ts` — streaming utility returning ReadableStream
- [ ] 8.3 Create `src/app/api/generate/route.ts` — POST handler wiring client to response

## 9. Design System

- [ ] 9.1 Create `src/app/globals.css` — CSS custom properties for all color tokens
- [ ] 9.2 Create `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- [ ] 9.3 Create `src/components/forge/ForgeButton.tsx` — primary/secondary/ghost variants
- [ ] 9.4 Create `src/components/forge/ForgeCard.tsx` — dark surface card
- [ ] 9.5 Create `src/components/forge/ForgeTextField.tsx` — styled single-line input
- [ ] 9.6 Create `src/components/forge/ForgeTextEditor.tsx` — styled multi-line textarea
- [ ] 9.7 Create `src/components/forge/StatusChip.tsx` — status label chip

## 10. App Shell

- [ ] 10.1 Create `src/app/layout.tsx` — root layout (fonts, dark bg, Supabase provider)
- [ ] 10.2 Create `src/app/page.tsx` — landing / redirect to dashboard or login
- [ ] 10.3 Create `src/app/(auth)/login/page.tsx` — login page with email magic link UI
- [ ] 10.4 Create `src/app/(app)/layout.tsx` — authenticated shell with sidebar
- [ ] 10.5 Create `src/app/(app)/dashboard/page.tsx` — project grid placeholder

## 11. Verification

- [ ] 11.1 `npm run build` succeeds with 0 TypeScript errors
- [ ] 11.2 All Forge components render without console errors in browser
- [ ] 11.3 Auth middleware correctly redirects unauthenticated requests
- [ ] 11.4 `/api/generate` returns 200 with streaming content-type on valid POST

## 12. Commit

- [ ] 12.1 Commit: `feat: initialize PromptForge with Next.js + Supabase foundation`
- [ ] 12.2 Push to `origin/claude/build-promptforge-app-wumtR`
