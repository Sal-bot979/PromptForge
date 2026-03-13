# Phase 3 Tasks: Artifact Generation Engine

## 1. Documentation

- [x] 1.1 Create `docs/phases/PHASE_3_GENERATION.md`
- [x] 1.2 Create `docs/tasks/PHASE_3_TASKS.md` (this file)

## 2. Generation Store

- [ ] 2.1 Create `src/store/generationStore.ts` with:
        - `artifactStates`: Record<ArtifactType, ArtifactState>
        - `ArtifactState`: { status, streamingContent, savedContent, error }
        - Actions: initFromSaved, startGeneration, appendContent,
          completeGeneration, setError, resetArtifact

## 3. UI Components

- [ ] 3.1 Create `src/components/features/ArtifactGeneration/StreamingText.tsx`:
        - Renders `content` string character-by-character (content is pre-built)
        - Shows blinking cursor (`streaming-cursor` class) while status === 'generating'
        - Monospace font for the raw content display
- [ ] 3.2 Create `src/components/features/ArtifactGeneration/MarkdownPreview.tsx`:
        - Renders markdown as HTML using a lightweight parser
        - Styled for dark theme (headings, code blocks, lists, tables)
        - Toggle between raw and preview mode
- [ ] 3.3 Create `src/components/features/ArtifactGeneration/ArtifactCard.tsx`:
        - Header: artifact type label + StatusChip
        - Body: StreamingText (generating) or MarkdownPreview (complete) or empty state
        - Actions: Generate button (idle/error) | Cancel (generating) | Copy + Regenerate (complete)
        - Connects to generationStore for its artifact type
        - Calls runArtifactGeneration() on generate click
- [ ] 3.4 Create `src/components/features/ArtifactGeneration/GenerateAllButton.tsx`:
        - "Generate All" button: fires generation for all 10 types simultaneously
        - Disabled while any generation is in progress
        - Shows progress count: "Generating 4/10…"
- [ ] 3.5 Create `src/components/features/ArtifactGeneration/ArtifactGrid.tsx`:
        - 2-column responsive grid of ArtifactCards for all 10 types
        - Accepts projectContext + styleProfile as props (passed down to each card)
- [ ] 3.6 Create `src/components/features/ArtifactGeneration/index.ts`

## 4. Generation Logic

- [ ] 4.1 Add `runArtifactGeneration(type, projectContext, store)` function to
        generationStore — calls /api/generate, streams into store, saves on done

## 5. Project Detail Page

- [ ] 5.1 Create `src/app/(app)/project/[id]/actions.ts`:
        - `saveArtifactAction(projectId, type, content)`: upserts artifact row
- [ ] 5.2 Create `src/app/(app)/project/[id]/page.tsx`:
        - Server component: loads project + all artifacts from Supabase
        - 404 if project not found or belongs to another user
        - Passes data to `<ArtifactGrid>` client component

## 6. Post-Intake Redirect

- [ ] 6.1 Update `ProjectSummaryView` to redirect to `/project/${id}` instead of `/dashboard`

## 7. Verification

- [ ] 7.1 Create project → lands on `/project/[id]` with 10 empty cards
- [ ] 7.2 Generate single artifact → streams in, saves, card shows Copy button
- [ ] 7.3 Generate All → 10 streams run simultaneously
- [ ] 7.4 Revisit project page → previously generated artifacts load from DB
- [ ] 7.5 `npm run build` succeeds

## 8. Commit

- [ ] 8.1 Commit: `feat(generation): add artifact generation engine with streaming UI`
- [ ] 8.2 Push to `origin/claude/build-promptforge-app-wumtR`
