-- PromptForge Seed Data
-- 20 starter snippets seeded for all new users on first sign-up.
-- These are inserted by the application logic, not directly by this file,
-- since they require a user_id. This file serves as the canonical source.
--
-- Usage: call seedStarterSnippets(userId) from the app after first sign-up.

-- This SQL is for reference — the actual seed is applied via the
-- src/lib/supabase/seed.ts function using the user's authenticated client.

-- Snippet categories:
--   Tech Stack, API Design, Authentication, Testing, Architecture,
--   Deployment, Documentation, AI Integration, UI/UX, Performance

-- ─── Starter Snippets Reference ──────────────────────────────────────────────
-- ID  | Category         | Name                            | Trigger Keywords
-- ----|------------------|---------------------------------|------------------
-- 1   | Tech Stack       | Next.js App Router Stack        | next.js, nextjs, react
-- 2   | Tech Stack       | Supabase Full Stack             | supabase, postgres
-- 3   | Tech Stack       | TypeScript Strict Config        | typescript, ts
-- 4   | API Design       | REST API Conventions            | rest, api, endpoint
-- 5   | API Design       | Error Response Format           | api, error handling
-- 6   | Authentication   | Supabase Auth Patterns          | auth, login, signup
-- 7   | Authentication   | JWT + RLS Security Model        | jwt, rls, security
-- 8   | Testing          | Vitest + Testing Library Setup  | test, vitest
-- 9   | Testing          | E2E Playwright Patterns         | e2e, playwright
-- 10  | Architecture     | TCA / Reducer Pattern           | reducer, state management
-- 11  | Architecture     | Repository Pattern              | repository, data access
-- 12  | Deployment       | Vercel Deployment Config        | vercel, deploy
-- 13  | Deployment       | Environment Variable Checklist  | env, environment
-- 14  | Documentation    | PRD Structure Template          | prd, requirements
-- 15  | Documentation    | CLAUDE.md Conventions           | claude, conventions
-- 16  | AI Integration   | Claude Streaming Pattern        | claude, streaming, ai
-- 17  | AI Integration   | Prompt Engineering Rules        | prompt, llm, ai
-- 18  | UI/UX            | shadcn Dark Theme Setup         | shadcn, dark mode, ui
-- 19  | UI/UX            | Accessibility Checklist         | a11y, accessibility
-- 20  | Performance      | Next.js Performance Checklist   | performance, core web vitals

-- The full content for each snippet is defined in:
-- src/lib/supabase/starterSnippets.ts
