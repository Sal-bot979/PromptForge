import { create } from 'zustand'
import type { ArtifactType, GenerationStatus } from '@/types'
import { ARTIFACT_TYPE_ORDER } from '@/types'
import type { GenerateRequest, ProjectContext, StyleProfileContext } from '@/lib/claude/types'
import type { StreamChunkPayload } from '@/lib/claude/types'

// ─── State types ──────────────────────────────────────────────────────────────

export interface ArtifactState {
  status: GenerationStatus
  /** Content accumulating during streaming, or the final content on complete */
  streamingContent: string
  /** Content last saved to Supabase (null = not yet saved) */
  savedContent: string | null
  error: string | null
}

const defaultArtifactState = (): ArtifactState => ({
  status: 'idle',
  streamingContent: '',
  savedContent: null,
  error: null,
})

type ArtifactStateMap = Record<ArtifactType, ArtifactState>

function buildInitialMap(): ArtifactStateMap {
  return Object.fromEntries(
    ARTIFACT_TYPE_ORDER.map((t) => [t, defaultArtifactState()]),
  ) as ArtifactStateMap
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface GenerationState {
  artifactStates: ArtifactStateMap
  /** The project ID this store is scoped to */
  projectId: string | null
}

interface GenerationActions {
  /** Hydrate the store with artifacts already saved in Supabase */
  initFromSaved: (projectId: string, saved: Array<{ type: ArtifactType; content: string }>) => void
  startGeneration: (type: ArtifactType) => void
  appendContent: (type: ArtifactType, delta: string) => void
  completeGeneration: (type: ArtifactType) => void
  setError: (type: ArtifactType, error: string) => void
  markSaved: (type: ArtifactType, content: string) => void
  resetArtifact: (type: ArtifactType) => void
  reset: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGenerationStore = create<GenerationState & GenerationActions>()((set) => ({
  artifactStates: buildInitialMap(),
  projectId: null,

  initFromSaved: (projectId, saved) =>
    set((state) => {
      const next = buildInitialMap()
      for (const { type, content } of saved) {
        next[type] = {
          status: 'complete',
          streamingContent: content,
          savedContent: content,
          error: null,
        }
      }
      return { artifactStates: next, projectId }
    }),

  startGeneration: (type) =>
    set((state) => ({
      artifactStates: {
        ...state.artifactStates,
        [type]: { status: 'generating', streamingContent: '', savedContent: null, error: null },
      },
    })),

  appendContent: (type, delta) =>
    set((state) => ({
      artifactStates: {
        ...state.artifactStates,
        [type]: {
          ...state.artifactStates[type],
          streamingContent: state.artifactStates[type].streamingContent + delta,
        },
      },
    })),

  completeGeneration: (type) =>
    set((state) => ({
      artifactStates: {
        ...state.artifactStates,
        [type]: { ...state.artifactStates[type], status: 'complete' },
      },
    })),

  setError: (type, error) =>
    set((state) => ({
      artifactStates: {
        ...state.artifactStates,
        [type]: { ...state.artifactStates[type], status: 'error', error },
      },
    })),

  markSaved: (type, content) =>
    set((state) => ({
      artifactStates: {
        ...state.artifactStates,
        [type]: { ...state.artifactStates[type], savedContent: content },
      },
    })),

  resetArtifact: (type) =>
    set((state) => ({
      artifactStates: { ...state.artifactStates, [type]: defaultArtifactState() },
    })),

  reset: () => set({ artifactStates: buildInitialMap(), projectId: null }),
}))

// ─── Generation runner ────────────────────────────────────────────────────────

/**
 * Fires a single artifact generation request against /api/generate.
 *
 * Streams content into the Zustand store delta-by-delta, then calls
 * saveArtifactAction to persist on completion.
 *
 * @param type - The artifact type to generate
 * @param projectContext - Project data for prompt compilation
 * @param projectId - Supabase project ID for saving
 * @param store - Zustand store actions
 * @param signal - Optional AbortSignal for cancellation
 */
export async function runArtifactGeneration(
  type: ArtifactType,
  projectContext: ProjectContext,
  projectId: string,
  store: Pick<
    GenerationActions,
    'startGeneration' | 'appendContent' | 'completeGeneration' | 'setError' | 'markSaved'
  >,
  signal?: AbortSignal,
): Promise<void> {
  store.startGeneration(type)

  // Default style profile — Phase 4 will wire up user's active profile
  const styleProfile: StyleProfileContext = {
    styleType: 'structured',
    rules: [],
    learnedOverrides: [],
  }

  const body: GenerateRequest = {
    artifactType: type,
    projectContext,
    styleProfile,
    snippets: [],
  }

  let accumulated = ''

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error((data as { error?: string }).error ?? 'Generation request failed')
    }

    if (!response.body) throw new Error('No response body')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const chunk = JSON.parse(line) as StreamChunkPayload
          if (chunk.type === 'delta' && chunk.content) {
            accumulated += chunk.content
            store.appendContent(type, chunk.content)
          } else if (chunk.type === 'error') {
            throw new Error(chunk.error ?? 'Generation failed')
          }
        } catch {
          // skip malformed lines
        }
      }
    }

    store.completeGeneration(type)

    // Save to Supabase (dynamic import avoids bundling server action into client chunk)
    const { saveArtifactAction } = await import('@/app/(app)/project/[id]/actions')
    const result = await saveArtifactAction(projectId, type, accumulated)
    if ('error' in result) {
      // Non-fatal: content is already in the store, just not persisted
      console.warn(`[generation] Failed to save ${type}:`, result.error)
    } else {
      store.markSaved(type, accumulated)
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      // User cancelled — reset to idle so they can retry
      useGenerationStore.getState().resetArtifact(type)
      return
    }
    const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
    store.setError(type, msg)
  }
}
