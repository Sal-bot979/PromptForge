# Phase 3: Artifact Generation Engine

## Goal

The core value of PromptForge: generating all 10 artifact types from a project description.
Users land on the project detail page after intake, see 10 artifact cards, and can generate
any or all with one click. Each artifact streams in real time. Copy is the primary CTA.

## Scope

- `/project/[id]` page showing all 10 artifact slots for a project
- Per-artifact generation via the existing `/api/generate` Route Handler
- Parallel "Generate All" — fires all 10 simultaneously
- Streaming text display with live token-by-token update
- Markdown rendered preview for completed artifacts
- Copy to clipboard as primary CTA on every artifact
- `saveArtifactAction` — persists generated content to Supabase `artifacts` table
- Generation Zustand store managing per-artifact status + streaming content
- Redirect from new-project creation to `/project/[id]`

## Non-Goals

- Prompt Lab editor (Phase 5)
- Style engine (Phase 4)
- Snippet injection (Phase 7)
- Version history (Phase 5)

## Deliverables

| File | Purpose |
|---|---|
| `docs/phases/PHASE_3_GENERATION.md` | This file |
| `docs/tasks/PHASE_3_TASKS.md` | Granular checklist |
| `src/store/generationStore.ts` | Zustand store for artifact generation state |
| `src/app/(app)/project/[id]/page.tsx` | Project detail page (server component) |
| `src/app/(app)/project/[id]/actions.ts` | saveArtifactAction |
| `src/components/features/ArtifactGeneration/ArtifactCard.tsx` | Per-artifact card |
| `src/components/features/ArtifactGeneration/ArtifactGrid.tsx` | 10-artifact grid |
| `src/components/features/ArtifactGeneration/StreamingText.tsx` | Animated stream display |
| `src/components/features/ArtifactGeneration/MarkdownPreview.tsx` | Rendered markdown |
| `src/components/features/ArtifactGeneration/GenerateAllButton.tsx` | Parallel generate CTA |
| `src/components/features/ArtifactGeneration/index.ts` | Barrel export |

## Definition of Done

- [ ] After creating a project, user is redirected to `/project/[id]`
- [ ] Project detail page shows project name, description, and all 10 artifact cards
- [ ] Clicking "Generate" on any card streams content into the card in real time
- [ ] "Generate All" fires all 10 simultaneously; each streams independently
- [ ] "Copy" copies the raw markdown to clipboard
- [ ] Generated artifact is saved to Supabase after streaming completes
- [ ] Previously generated artifacts load from DB on page revisit
- [ ] Errors are shown inline on the failed card with a retry button
- [ ] `npm run build` passes with zero TypeScript errors
