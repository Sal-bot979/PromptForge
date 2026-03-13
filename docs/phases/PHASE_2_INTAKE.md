# Phase 2: Project Intake & Structuring

## Goal

Users can describe a project in natural language (or via a guided wizard) and see it
structured into a clean, editable spec in real time. At the end of intake, they confirm
the spec and create the project — which persists to Supabase and is ready for artifact
generation in Phase 3.

## Scope

- Freeform intake: large text area where users describe their project freely
- Guided intake: step-by-step wizard (concept → users → goals → constraints → tech stack → deployment)
- Real-time extraction: `/api/extract-spec` streams Claude's structured extraction as it arrives
- Structured spec preview: sidebar populates in real time as extraction completes
- Project summary: review + edit extracted spec before creating
- `createProject` server action: saves project + spec to Supabase
- Similarity detection: fuzzy-match project name against existing projects, surface "import context" suggestion

## Non-Goals

- Artifact generation (Phase 3)
- Voice input (browser API, deferred)
- Editing an existing project (Phase 6)
- Sharing / collaboration (Phase 10)

## Deliverables

| File | Purpose |
|---|---|
| `docs/phases/PHASE_2_INTAKE.md` | This file |
| `docs/tasks/PHASE_2_TASKS.md` | Granular checklist |
| `src/app/api/extract-spec/route.ts` | Streaming Claude extraction endpoint |
| `src/lib/claude/prompts/extractSpec.ts` | Extraction system prompt |
| `src/store/intakeStore.ts` | Zustand store for intake form state |
| `src/app/(app)/new-project/page.tsx` | New project page |
| `src/app/(app)/new-project/actions.ts` | `createProjectAction` server action |
| `src/components/features/ProjectIntake/index.ts` | Barrel export |
| `src/components/features/ProjectIntake/ProjectIntakeForm.tsx` | Root form with mode tabs |
| `src/components/features/ProjectIntake/FreeformInput.tsx` | Freeform description + extract trigger |
| `src/components/features/ProjectIntake/GuidedIntakeForm.tsx` | Step-by-step guided wizard |
| `src/components/features/ProjectIntake/SpecPreviewPanel.tsx` | Real-time structured spec sidebar |
| `src/components/features/ProjectIntake/ProjectSummaryView.tsx` | Final review before create |

## Definition of Done

- [ ] User can navigate to `/new-project` from dashboard
- [ ] Freeform mode: typing a description and clicking "Extract" calls `/api/extract-spec`
      and populates the spec preview panel with streamed results
- [ ] Guided mode: user can fill in each step and the spec preview reflects their input
- [ ] "Create Project" submits to `createProjectAction`, saves to Supabase, redirects to `/dashboard`
- [ ] Similarity detection surfaces a warning if a project with a similar name already exists
- [ ] `npm run build` passes with zero TypeScript errors after Phase 2 additions
