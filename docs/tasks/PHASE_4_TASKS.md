# Phase 4 Tasks: Style Engine

## 1. Documentation

- [x] 1.1 Create `docs/phases/PHASE_4_STYLE.md`
- [x] 1.2 Create `docs/tasks/PHASE_4_TASKS.md` (this file)

## 2. Seed Data

- [ ] 2.1 Create `src/lib/supabase/seedStyleProfiles.ts`:
        - Define the 3 built-in profiles (Structured / Narrative / Terse) with rules[]
        - `seedBuiltInStyleProfiles(userId)`: inserts them for a new user if not present
        - Called from the /styles page on first visit

## 3. Style Store

- [ ] 3.1 Create `src/store/styleStore.ts`:
        - `profiles`: StyleProfile[]
        - `activeProfileId`: string | null
        - `artifactOverrides`: Partial<Record<ArtifactType, string>>
        - Actions: initProfiles, setActiveProfile, setArtifactOverride, clearArtifactOverride
        - `getActiveProfile()`: returns the resolved StyleProfileContext for generation

## 4. Server Actions

- [ ] 4.1 Create `src/app/(app)/styles/actions.ts`:
        - `listStyleProfilesAction()`: returns all profiles for the user (seeds built-ins if empty)
        - `createStyleProfileAction(input)`: insert new custom profile
        - `updateStyleProfileAction(id, input)`: update rules/name (cannot edit built-ins)
        - `deleteStyleProfileAction(id)`: delete (cannot delete built-ins; set is_default guard)
        - `setActiveStyleProfileAction(id)`: updates user_preferences.active_style_profile_id

## 5. UI Components

- [ ] 5.1 Create `src/components/features/StyleEngine/StyleProfileCard.tsx`:
        - Shows profile name, style_type badge, rule count
        - "Built-in" chip for structured/narrative/terse
        - Edit and Delete actions for custom profiles
        - Active indicator (checkmark ring)
- [ ] 5.2 Create `src/components/features/StyleEngine/StyleBuilderForm.tsx`:
        - Name input, base style_type selector
        - Dynamic rule list: add/remove/reorder text rules
        - Preview button → opens StylePreviewPanel
        - Save / Cancel actions
- [ ] 5.3 Create `src/components/features/StyleEngine/StylePreviewPanel.tsx`:
        - Renders same ~200 word sample artifact content in all 3 built-in style voices
        - Side-by-side or tabbed layout depending on viewport
        - "Select this style" CTA under each column
- [ ] 5.4 Create `src/components/features/StyleEngine/StyleSelector.tsx`:
        - Compact dropdown showing active profile name
        - Lists all user profiles with style_type badges
        - "Manage Styles" link at the bottom
        - Reads from + writes to styleStore
- [ ] 5.5 Create `src/components/features/StyleEngine/StyleStoreInitializer.tsx`:
        - Client component, receives profiles + activeProfileId as props
        - Calls initProfiles() on mount to hydrate styleStore
- [ ] 5.6 Create `src/components/features/StyleEngine/index.ts`

## 6. Styles Page

- [ ] 6.1 Create `src/app/(app)/styles/page.tsx`:
        - Server component: loads profiles (seeds if empty), loads active profile from prefs
        - Renders StyleStoreInitializer + grid of StyleProfileCards
        - "New Style" button → inline form or modal with StyleBuilderForm

## 7. Wire Style into Generation

- [ ] 7.1 Update `ArtifactGrid` to accept `initialActiveProfileId` and `profiles` props
        and render `<StyleStoreInitializer>` + `<StyleSelector>` in its header
- [ ] 7.2 Update `runArtifactGeneration` to read the active StyleProfileContext from
        styleStore (falling back to 'structured' if no profile set)
- [ ] 7.3 Add per-artifact style override to `ArtifactCard`: small style badge in the
        header that opens a popover to pick a different style for just this artifact

## 8. Project Page Integration

- [ ] 8.1 Update `/project/[id]/page.tsx` to load user's style profiles + active profile ID
        and pass them to `ArtifactGrid`

## 9. Verification

- [ ] 9.1 Generating with "Narrative" style produces prose-driven output vs "Structured" bullet lists
- [ ] 9.2 Custom profile with a rule ("Always start with a TL;DR") is visible in generated output
- [ ] 9.3 Per-artifact override: one card on Terse while project is on Structured
- [ ] 9.4 `npm run build` passes

## 10. Commit

- [ ] 10.1 Commit: `feat(style): add style engine with Structured/Narrative/Terse profiles`
- [ ] 10.2 Push to `origin/claude/build-promptforge-app-wumtR`
