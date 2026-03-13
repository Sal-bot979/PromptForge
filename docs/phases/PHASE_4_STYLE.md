# Phase 4: Style Engine

## Goal

PromptForge learns and applies the user's preferred output style across all artifact
generations. Three built-in profiles (Structured / Narrative / Terse) are seeded on
first use. Users can create custom profiles with their own rules. Style is applied
live — switching profiles before generating changes the output immediately.

## Scope

- Three built-in style profiles seeded for every new user
- Style profile CRUD: list, create, edit, delete via `/styles` page
- `styleStore` (Zustand): active profile, per-artifact overrides, profile list
- `StyleSelector` dropdown on the project detail page header
- `StyleBuilderForm`: add/remove/reorder custom rules on a profile
- `StylePreviewPanel`: renders the same sample content in all 3 built-in styles side-by-side
- Per-artifact style override on each ArtifactCard
- Wire active style profile into `runArtifactGeneration` (replaces hardcoded 'structured')
- `StyleStoreInitializer`: client component that hydrates styleStore from server-loaded data

## Non-Goals

- Style learning from edits (Phase 5, after Prompt Lab editor exists)
- Team shared style libraries (Phase 10)
- Importing/exporting style profiles (Phase 10)

## Deliverables

| File | Purpose |
|---|---|
| `docs/phases/PHASE_4_STYLE.md` | This file |
| `docs/tasks/PHASE_4_TASKS.md` | Granular checklist |
| `src/store/styleStore.ts` | Zustand store for style profiles + active selection |
| `src/lib/supabase/seedStyleProfiles.ts` | Built-in profile seed data + seed function |
| `src/app/(app)/styles/page.tsx` | Style profiles list page |
| `src/app/(app)/styles/actions.ts` | CRUD server actions |
| `src/components/features/StyleEngine/StyleProfileCard.tsx` | Profile card (list view) |
| `src/components/features/StyleEngine/StyleBuilderForm.tsx` | Create/edit profile |
| `src/components/features/StyleEngine/StylePreviewPanel.tsx` | 3-style comparison |
| `src/components/features/StyleEngine/StyleSelector.tsx` | Active profile picker |
| `src/components/features/StyleEngine/StyleStoreInitializer.tsx` | Client hydration shim |
| `src/components/features/StyleEngine/index.ts` | Barrel export |

## Definition of Done

- [ ] Three built-in profiles (Structured, Narrative, Terse) appear in `/styles` on first visit
- [ ] User can create a custom profile with a name and 1+ rules
- [ ] User can edit and delete non-built-in profiles
- [ ] StyleSelector on `/project/[id]` switches the active profile
- [ ] Generating an artifact uses the active style profile (not hardcoded 'structured')
- [ ] Per-artifact override overrides the active profile for that artifact type only
- [ ] StylePreviewPanel shows the same content rendered in all 3 built-in styles
- [ ] `npm run build` passes with zero TypeScript errors
