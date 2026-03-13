'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { ArtifactType } from '@/types'

type SaveResult = { ok: true } | { error: string }

/**
 * Server action: upserts an artifact row in Supabase.
 *
 * Uses ON CONFLICT (project_id, type) DO UPDATE to handle re-generation —
 * each project has at most one artifact per type (the latest version).
 * Increments the version counter on each re-generation.
 *
 * Called automatically by runArtifactGeneration() after the stream completes.
 */
export async function saveArtifactAction(
  projectId: string,
  type: ArtifactType,
  content: string,
): Promise<SaveResult> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { error: 'Unauthorized' }

  // Verify the project belongs to this user before writing
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (projectError || !project) {
    return { error: 'Project not found' }
  }

  // Check if an artifact already exists so we can increment the version
  const { data: existing } = await supabase
    .from('artifacts')
    .select('version')
    .eq('project_id', projectId)
    .eq('type', type)
    .maybeSingle()

  const nextVersion = (existing?.version ?? 0) + 1

  const { error: upsertError } = await supabase.from('artifacts').upsert(
    {
      project_id: projectId,
      type,
      content,
      version: nextVersion,
      generated_at: new Date().toISOString(),
      edited_at: null,
    },
    { onConflict: 'project_id,type' },
  )

  if (upsertError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[saveArtifactAction] Upsert failed:', upsertError)
    }
    return { error: 'Failed to save artifact. Your content is still available in the editor.' }
  }

  return { ok: true }
}
