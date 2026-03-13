'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { ProjectSpec } from '@/types'

interface CreateProjectInput {
  name: string
  description: string
  structuredSpec: Partial<ProjectSpec> | null
  tags: string[]
}

type CreateProjectResult =
  | { projectId: string }
  | { error: string }

/**
 * Server action: creates a new project in Supabase.
 *
 * Validates input, checks for name similarity (case-insensitive exact match),
 * inserts the project row, and returns the new project's ID.
 *
 * Similarity detection uses a simple case-insensitive match for Phase 2.
 * Phase 6 will upgrade this to trigram fuzzy matching.
 */
export async function createProjectAction(input: CreateProjectInput): Promise<CreateProjectResult> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'You must be signed in to create a project.' }
  }

  const name = input.name.trim()
  if (!name) {
    return { error: 'Project name is required.' }
  }
  if (name.length > 200) {
    return { error: 'Project name must be under 200 characters.' }
  }

  // Similarity detection: check for a project with the same name (case-insensitive)
  const { data: existing } = await supabase
    .from('projects')
    .select('id, name')
    .eq('user_id', user.id)
    .ilike('name', name)
    .maybeSingle()

  if (existing) {
    return {
      error: `A project named "${existing.name}" already exists. Please choose a different name or open the existing project.`,
    }
  }

  // Build structured_spec: only include if at least concept is present
  const spec = input.structuredSpec
  const hasSpec = spec && (spec.concept || (spec.goals?.length ?? 0) > 0)

  const { data: project, error: insertError } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name,
      description: input.description.trim(),
      structured_spec: hasSpec ? spec : null,
      tags: input.tags,
    })
    .select('id')
    .single()

  if (insertError || !project) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[createProjectAction] Insert failed:', insertError)
    }
    return { error: 'Something went wrong. Please try again.' }
  }

  return { projectId: project.id }
}
