/**
 * Central type exports for PromptForge.
 * Import from '@/types' for all app-level types.
 */

export type {
  ArtifactType,
  StyleType,
  Project,
  Artifact,
  StyleProfile,
  Snippet,
  GenerationHistory,
  UserPreferences,
  ProjectSpec,
  LearnedOverride,
  ProjectInsert,
  ProjectUpdate,
  ArtifactInsert,
  ArtifactUpdate,
  StyleProfileInsert,
  StyleProfileUpdate,
  SnippetInsert,
  SnippetUpdate,
  GenerationHistoryInsert,
} from './database'

// ─── UI / App types ───────────────────────────────────────────────────────────

/** All 10 artifact types with human-readable labels */
export const ARTIFACT_TYPE_LABELS: Record<import('./database').ArtifactType, string> = {
  prd: 'PRD',
  architecture: 'Architecture',
  design: 'Design Spec',
  phases: 'Phase Plan',
  testing: 'Testing Strategy',
  claude_md: 'CLAUDE.md',
  antigravity: 'Antigravity Prompt',
  claude_code: 'Claude Code Prompt',
  deployment: 'Deployment Checklist',
  changelog: 'Changelog Template',
}

/** Ordered list of artifact types for generation UI */
export const ARTIFACT_TYPE_ORDER: import('./database').ArtifactType[] = [
  'prd',
  'architecture',
  'design',
  'phases',
  'testing',
  'claude_md',
  'antigravity',
  'claude_code',
  'deployment',
  'changelog',
]

export const STYLE_TYPE_LABELS: Record<import('./database').StyleType, string> = {
  structured: 'Structured',
  narrative: 'Narrative',
  terse: 'Terse',
  custom: 'Custom',
}

/** Generation status for streaming UI */
export type GenerationStatus = 'idle' | 'generating' | 'complete' | 'error'

/** Streaming chunk from the generate API */
export interface StreamChunk {
  type: 'delta' | 'done' | 'error'
  content?: string
  error?: string
}
