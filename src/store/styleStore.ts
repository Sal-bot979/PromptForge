import { create } from 'zustand'
import type { StyleProfile, ArtifactType } from '@/types'
import type { StyleProfileContext } from '@/lib/claude/types'

interface StyleState {
  profiles: StyleProfile[]
  activeProfileId: string | null
  /** Per-artifact overrides: map from ArtifactType to profile ID */
  artifactOverrides: Partial<Record<ArtifactType, string>>
}

interface StyleActions {
  initProfiles: (profiles: StyleProfile[], activeProfileId: string | null) => void
  setActiveProfile: (profileId: string) => void
  setArtifactOverride: (type: ArtifactType, profileId: string) => void
  clearArtifactOverride: (type: ArtifactType) => void
  addProfile: (profile: StyleProfile) => void
  updateProfile: (profile: StyleProfile) => void
  removeProfile: (profileId: string) => void
}

export const useStyleStore = create<StyleState & StyleActions>()((set, get) => ({
  profiles: [],
  activeProfileId: null,
  artifactOverrides: {},

  initProfiles: (profiles, activeProfileId) => set({ profiles, activeProfileId }),

  setActiveProfile: (profileId) => set({ activeProfileId: profileId }),

  setArtifactOverride: (type, profileId) =>
    set((s) => ({ artifactOverrides: { ...s.artifactOverrides, [type]: profileId } })),

  clearArtifactOverride: (type) =>
    set((s) => {
      const next = { ...s.artifactOverrides }
      delete next[type]
      return { artifactOverrides: next }
    }),

  addProfile: (profile) => set((s) => ({ profiles: [...s.profiles, profile] })),

  updateProfile: (profile) =>
    set((s) => ({
      profiles: s.profiles.map((p) => (p.id === profile.id ? profile : p)),
    })),

  removeProfile: (profileId) =>
    set((s) => ({
      profiles: s.profiles.filter((p) => p.id !== profileId),
      // If the deleted profile was active, clear the selection
      activeProfileId: s.activeProfileId === profileId ? null : s.activeProfileId,
    })),
}))

// ─── Selector helpers ─────────────────────────────────────────────────────────

/**
 * Returns the resolved StyleProfileContext for a given artifact type.
 *
 * Resolution order:
 * 1. Per-artifact override for this type
 * 2. Active profile
 * 3. Default built-in 'structured' fallback
 */
export function resolveStyleForArtifact(
  type: ArtifactType,
  state: StyleState,
): StyleProfileContext {
  const overrideId = state.artifactOverrides[type]
  const profileId = overrideId ?? state.activeProfileId

  const profile = profileId ? state.profiles.find((p) => p.id === profileId) : null

  if (!profile) {
    // Fallback: find the built-in Structured profile or use a hardcoded default
    const structured = state.profiles.find((p) => p.style_type === 'structured')
    if (structured) return profileToContext(structured)
    return { styleType: 'structured', rules: [], learnedOverrides: [] }
  }

  return profileToContext(profile)
}

function profileToContext(profile: StyleProfile): StyleProfileContext {
  return {
    styleType: profile.style_type,
    rules: profile.rules,
    learnedOverrides: profile.learned_overrides.map((o) => ({
      pattern: o.pattern,
      replacement: o.replacement,
    })),
  }
}

/** True if the profile is one of the three built-ins (by style_type + name match) */
export function isBuiltInProfile(profile: StyleProfile): boolean {
  return ['structured', 'narrative', 'terse'].includes(profile.style_type) &&
    ['Structured', 'Narrative', 'Terse'].includes(profile.name)
}
