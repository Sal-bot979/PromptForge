/**
 * Database type definitions for PromptForge.
 *
 * These types mirror the Supabase PostgreSQL schema defined in
 * supabase/migrations/001_initial_schema.sql.
 *
 * After any schema change, regenerate with:
 *   supabase gen types typescript --local > src/types/database.ts
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ArtifactType =
  | 'prd'
  | 'architecture'
  | 'design'
  | 'phases'
  | 'testing'
  | 'claude_md'
  | 'antigravity'
  | 'claude_code'
  | 'deployment'
  | 'changelog'

export type StyleType = 'structured' | 'narrative' | 'terse' | 'custom'

// ─── Table row types ──────────────────────────────────────────────────────────

export interface Project {
  id: string
  user_id: string
  name: string
  description: string
  /** Structured extraction result from Claude — concept, users, goals, constraints, techStack, deployment */
  structured_spec: ProjectSpec | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Artifact {
  id: string
  project_id: string
  type: ArtifactType
  content: string
  /** Increments each time content is re-generated */
  version: number
  generated_at: string
  edited_at: string | null
}

export interface StyleProfile {
  id: string
  user_id: string
  name: string
  style_type: StyleType
  /** Array of style rule strings e.g. "Use numbered lists for all sequences" */
  rules: string[]
  /** Learned overrides extracted from user edits — { pattern: string, replacement: string }[] */
  learned_overrides: LearnedOverride[]
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Snippet {
  id: string
  user_id: string
  name: string
  content: string
  category: string
  /** Keywords that trigger auto-injection when they appear in a project description */
  trigger_keywords: string[]
  usage_count: number
  created_at: string
  updated_at: string
}

export interface GenerationHistory {
  id: string
  artifact_id: string
  /** The compiled system + user prompt sent to Claude */
  prompt: string
  /** The raw Claude response */
  response: string
  /** The user's edited version, if they modified the artifact after generation */
  edited_content: string | null
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  active_style_profile_id: string | null
  /** Default tool profile: 'claude_code' | 'cursor' | 'antigravity' */
  default_tool_profile: string
  /** Running count of generations this calendar month (for free tier limit) */
  monthly_gen_count: number
  /** ISO month string e.g. "2026-03" — resets monthly_gen_count when it changes */
  gen_count_month: string
  created_at: string
  updated_at: string
}

// ─── JSONB sub-types ──────────────────────────────────────────────────────────

export interface ProjectSpec {
  concept: string
  users: string[]
  goals: string[]
  constraints: string[]
  tech_stack: string[]
  deployment: string
}

export interface LearnedOverride {
  /** The pattern that was changed (original text or description) */
  pattern: string
  /** What the user replaced it with */
  replacement: string
  /** How many times this override has been applied */
  frequency: number
}

// ─── Insert / Update types ────────────────────────────────────────────────────

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>
export type ProjectUpdate = Partial<Omit<Project, 'id' | 'user_id' | 'created_at'>>

export type ArtifactInsert = Omit<Artifact, 'id' | 'generated_at' | 'edited_at'>
export type ArtifactUpdate = Partial<Pick<Artifact, 'content' | 'version' | 'edited_at'>>

export type StyleProfileInsert = Omit<StyleProfile, 'id' | 'created_at' | 'updated_at'>
export type StyleProfileUpdate = Partial<Omit<StyleProfile, 'id' | 'user_id' | 'created_at'>>

export type SnippetInsert = Omit<Snippet, 'id' | 'usage_count' | 'created_at' | 'updated_at'>
export type SnippetUpdate = Partial<Omit<Snippet, 'id' | 'user_id' | 'created_at'>>

export type GenerationHistoryInsert = Omit<GenerationHistory, 'id' | 'created_at'>
