# Phase 2 Tasks: Project Intake & Structuring

## 1. Documentation

- [x] 1.1 Create `docs/phases/PHASE_2_INTAKE.md`
- [x] 1.2 Create `docs/tasks/PHASE_2_TASKS.md` (this file)

## 2. Extraction API

- [ ] 2.1 Create `src/lib/claude/prompts/extractSpec.ts` — system prompt that extracts
        a structured ProjectSpec JSON from a freeform project description
- [ ] 2.2 Create `src/app/api/extract-spec/route.ts` — POST handler:
        auth guard → streams Claude extraction → returns newline-delimited JSON chunks
- [ ] 2.3 Verify: POST with a sample description returns a valid (partial) ProjectSpec

## 3. State Management

- [ ] 3.1 Create `src/store/intakeStore.ts` — Zustand store with:
        - `mode`: 'freeform' | 'guided'
        - `description`: string (freeform text)
        - `spec`: Partial<ProjectSpec> (populated by extraction)
        - `isExtracting`: boolean
        - `extractionError`: string | null
        - `guidedStep`: 0..5
        - Actions: setMode, setDescription, setSpec, setExtracting, nextStep, prevStep, reset

## 4. UI Components

- [ ] 4.1 Create `src/components/features/ProjectIntake/FreeformInput.tsx`:
        - ForgeTextEditor (large, min 8 rows) for project description
        - Character count + token estimate
        - "Extract Structure" button (calls /api/extract-spec, streams into store)
        - Three example prompt chips ("SaaS app", "CLI tool", "Mobile app")
- [ ] 4.2 Create `src/components/features/ProjectIntake/GuidedIntakeForm.tsx`:
        - 6-step wizard: Concept → Users → Goals → Constraints → Tech Stack → Deployment
        - Each step: label + ForgeTextField/ForgeTextEditor + validation
        - Step indicator showing current position
        - Back/Next navigation
- [ ] 4.3 Create `src/components/features/ProjectIntake/SpecPreviewPanel.tsx`:
        - Shows Partial<ProjectSpec> fields as they populate
        - Skeleton loaders for fields still being extracted
        - Each field is directly editable inline
        - Animated fade-in when a new field arrives
- [ ] 4.4 Create `src/components/features/ProjectIntake/ProjectSummaryView.tsx`:
        - Full review of extracted spec with all 6 fields editable
        - Project name input (required — extracted from concept or entered manually)
        - Tags multi-input (auto-suggested from tech stack)
        - "Create Project" CTA → calls `createProjectAction`
- [ ] 4.5 Create `src/components/features/ProjectIntake/ProjectIntakeForm.tsx`:
        - Tab toggle: "Freeform" | "Guided"
        - Left pane: FreeformInput or GuidedIntakeForm (based on mode)
        - Right pane: SpecPreviewPanel
        - Footer: ProjectSummaryView appears once spec has at least a concept
- [ ] 4.6 Create `src/components/features/ProjectIntake/index.ts` barrel export

## 5. Page & Server Action

- [ ] 5.1 Create `src/app/(app)/new-project/actions.ts`:
        - `createProjectAction(spec)`: validates → inserts project → returns project id
        - Checks for name uniqueness (similarity detection)
- [ ] 5.2 Create `src/app/(app)/new-project/page.tsx`:
        - Page metadata: title "New Project"
        - Renders `<ProjectIntakeForm />`
        - Handles redirect to `/project/[id]` after creation (placeholder for Phase 3)

## 6. Dashboard Integration

- [ ] 6.1 Update dashboard "New Project" `<ForgeButton>` to link to `/new-project`

## 7. Verification

- [ ] 7.1 Freeform mode end-to-end: describe → extract → spec populates → create project
- [ ] 7.2 Guided mode end-to-end: fill all steps → spec populates → create project
- [ ] 7.3 New project appears on dashboard after creation
- [ ] 7.4 `npm run build` passes with zero TypeScript errors

## 8. Commit

- [ ] 8.1 Commit: `feat(intake): add project intake with freeform + guided modes`
- [ ] 8.2 Push to `origin/claude/build-promptforge-app-wumtR`
