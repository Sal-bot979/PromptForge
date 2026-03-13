import { create } from 'zustand'
import type { ProjectSpec } from '@/types'
import type { StreamChunkPayload } from '@/lib/claude/types'

export type IntakeMode = 'freeform' | 'guided'

/** The 6 steps in guided intake mode */
export const GUIDED_STEPS = [
  { key: 'concept', label: 'Concept', description: "What does your project do? What problem does it solve?" },
  { key: 'users', label: 'Users', description: "Who will use it? Be specific about their role and context." },
  { key: 'goals', label: 'Goals', description: "What outcomes will it achieve? Think measurable results." },
  { key: 'constraints', label: 'Constraints', description: "Any technical, business, or scope constraints?" },
  { key: 'tech_stack', label: 'Tech Stack', description: "What technologies will you use?" },
  { key: 'deployment', label: 'Deployment', description: "Where and how will it run?" },
] as const

export type GuidedStepKey = (typeof GUIDED_STEPS)[number]['key']

/** Guided form values — one string per field before converting to arrays */
export interface GuidedFormValues {
  concept: string
  users: string       // newline-separated list
  goals: string       // newline-separated list
  constraints: string // newline-separated list
  tech_stack: string  // comma or newline-separated list
  deployment: string
}

interface IntakeState {
  mode: IntakeMode
  // Freeform mode
  description: string
  isExtracting: boolean
  extractionError: string | null
  // Structured spec (populated by extraction or guided form)
  spec: Partial<ProjectSpec>
  // Guided mode
  guidedStep: number
  guidedValues: GuidedFormValues
  // Project metadata
  projectName: string
  projectTags: string[]
  // Similarity detection
  similarProject: { id: string; name: string } | null
}

interface IntakeActions {
  setMode: (mode: IntakeMode) => void
  setDescription: (description: string) => void
  setIsExtracting: (isExtracting: boolean) => void
  setExtractionError: (error: string | null) => void
  setSpec: (spec: Partial<ProjectSpec>) => void
  mergeSpec: (patch: Partial<ProjectSpec>) => void
  setGuidedStep: (step: number) => void
  nextGuidedStep: () => void
  prevGuidedStep: () => void
  setGuidedValue: (key: GuidedStepKey, value: string) => void
  /** Convert guided form values to a ProjectSpec and store in spec */
  commitGuidedSpec: () => void
  setProjectName: (name: string) => void
  setProjectTags: (tags: string[]) => void
  setSimilarProject: (project: { id: string; name: string } | null) => void
  reset: () => void
}

const initialGuidedValues: GuidedFormValues = {
  concept: '',
  users: '',
  goals: '',
  constraints: '',
  tech_stack: '',
  deployment: '',
}

const initialState: IntakeState = {
  mode: 'freeform',
  description: '',
  isExtracting: false,
  extractionError: null,
  spec: {},
  guidedStep: 0,
  guidedValues: initialGuidedValues,
  projectName: '',
  projectTags: [],
  similarProject: null,
}

export const useIntakeStore = create<IntakeState & IntakeActions>()((set, get) => ({
  ...initialState,

  setMode: (mode) => set({ mode }),
  setDescription: (description) => set({ description }),
  setIsExtracting: (isExtracting) => set({ isExtracting }),
  setExtractionError: (error) => set({ extractionError: error }),
  setSpec: (spec) => set({ spec }),
  mergeSpec: (patch) => set((state) => ({ spec: { ...state.spec, ...patch } })),
  setGuidedStep: (guidedStep) => set({ guidedStep }),
  nextGuidedStep: () =>
    set((state) => ({
      guidedStep: Math.min(state.guidedStep + 1, GUIDED_STEPS.length - 1),
    })),
  prevGuidedStep: () => set((state) => ({ guidedStep: Math.max(state.guidedStep - 1, 0) })),
  setGuidedValue: (key, value) =>
    set((state) => ({ guidedValues: { ...state.guidedValues, [key]: value } })),
  commitGuidedSpec: () => {
    const { guidedValues } = get()
    const toArray = (s: string) =>
      s
        .split(/[\n,]+/)
        .map((x) => x.trim())
        .filter(Boolean)

    const spec: Partial<ProjectSpec> = {
      concept: guidedValues.concept.trim(),
      users: toArray(guidedValues.users),
      goals: toArray(guidedValues.goals),
      constraints: toArray(guidedValues.constraints),
      tech_stack: toArray(guidedValues.tech_stack),
      deployment: guidedValues.deployment.trim(),
    }
    set({ spec })
  },
  setProjectName: (projectName) => set({ projectName }),
  setProjectTags: (projectTags) => set({ projectTags }),
  setSimilarProject: (similarProject) => set({ similarProject }),
  reset: () => set(initialState),
}))

// ─── Extraction helper ────────────────────────────────────────────────────────

/**
 * Calls /api/extract-spec and streams the result into the intake store.
 * Updates isExtracting, spec, and extractionError automatically.
 *
 * @param description The freeform project description to extract from
 * @param store The intake store actions (pass `useIntakeStore.getState()`)
 * @param signal Optional AbortSignal to cancel the request
 */
export async function runExtraction(
  description: string,
  store: Pick<IntakeActions, 'setIsExtracting' | 'setSpec' | 'setExtractionError' | 'setProjectName'>,
  signal?: AbortSignal,
): Promise<void> {
  store.setIsExtracting(true)
  store.setExtractionError(null)

  let accumulated = ''

  try {
    const response = await fetch('/api/extract-spec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
      signal,
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error((data as { error?: string }).error ?? 'Extraction request failed')
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
          } else if (chunk.type === 'error') {
            throw new Error(chunk.error ?? 'Extraction failed')
          }
        } catch (parseErr) {
          // Skip malformed lines
        }
      }
    }

    // Parse the fully accumulated JSON
    const spec = JSON.parse(accumulated) as Partial<ProjectSpec>
    store.setSpec(spec)

    // Auto-populate project name from the concept if available
    if (spec.concept && spec.concept.length > 0) {
      // Derive a short name from the concept (first 4-5 words)
      const words = spec.concept.split(' ').slice(0, 5).join(' ')
      store.setProjectName(words)
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return
    const msg = err instanceof Error ? err.message : 'Extraction failed. Please try again.'
    store.setExtractionError(msg)
  } finally {
    store.setIsExtracting(false)
  }
}
