import type { ArtifactType, StyleType, ProjectSpec } from '@/types'

/**
 * Request body for the /api/generate endpoint.
 * All fields are validated server-side before calling the Claude API.
 */
export interface GenerateRequest {
  /** The type of artifact to generate */
  artifactType: ArtifactType
  /** Project context for prompt compilation */
  projectContext: ProjectContext
  /** Style profile to apply to the generation */
  styleProfile: StyleProfileContext
  /** Snippets to inject (pre-filtered by trigger_keywords match) */
  snippets: SnippetContext[]
}

/** Subset of Project used for prompt compilation (avoids sending DB metadata) */
export interface ProjectContext {
  name: string
  description: string
  structuredSpec: ProjectSpec | null
  tags: string[]
}

/** Subset of StyleProfile used for prompt compilation */
export interface StyleProfileContext {
  styleType: StyleType
  rules: string[]
  learnedOverrides: Array<{ pattern: string; replacement: string }>
}

/** Subset of Snippet used for prompt injection */
export interface SnippetContext {
  name: string
  content: string
  category: string
}

/**
 * A parsed chunk from the Claude streaming API.
 * The /api/generate route emits these as newline-delimited JSON.
 */
export interface StreamChunkPayload {
  /** 'delta': text content, 'done': generation complete, 'error': generation failed */
  type: 'delta' | 'done' | 'error'
  /** Present when type === 'delta' */
  content?: string
  /** Present when type === 'error' */
  error?: string
}

/** The Claude model to use for all PromptForge generations */
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514' as const

/** Maximum tokens for artifact generation */
export const MAX_TOKENS = 8192 as const
