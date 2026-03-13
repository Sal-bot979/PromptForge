'use server'

import { createServerClient } from '@/lib/supabase/server'
import { seedBuiltInStyleProfiles } from '@/lib/supabase/seedStyleProfiles'
import { isBuiltInProfile } from '@/store/styleStore'
import type { StyleProfile, StyleType } from '@/types'

type ActionResult<T = void> = { data: T } | { error: string }

// ─── List ─────────────────────────────────────────────────────────────────────

/**
 * Returns all style profiles for the authenticated user.
 * Seeds the three built-in profiles on first call if none exist.
 */
export async function listStyleProfilesAction(): Promise<ActionResult<StyleProfile[]>> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  // Seed built-ins for new users
  await seedBuiltInStyleProfiles(supabase, user.id)

  const { data, error } = await supabase
    .from('style_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return { error: 'Failed to load style profiles.' }

  return { data: data as StyleProfile[] }
}

// ─── Create ───────────────────────────────────────────────────────────────────

interface CreateStyleProfileInput {
  name: string
  style_type: StyleType
  rules: string[]
}

export async function createStyleProfileAction(
  input: CreateStyleProfileInput,
): Promise<ActionResult<StyleProfile>> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  if (!input.name.trim()) return { error: 'Profile name is required.' }
  if (input.name.length > 100) return { error: 'Profile name must be under 100 characters.' }

  const { data, error } = await supabase
    .from('style_profiles')
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      style_type: input.style_type,
      rules: input.rules.filter((r) => r.trim().length > 0),
      learned_overrides: [],
      is_default: false,
    })
    .select('*')
    .single()

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error('[createStyleProfileAction]', error)
    return { error: 'Failed to create style profile.' }
  }

  return { data: data as StyleProfile }
}

// ─── Update ───────────────────────────────────────────────────────────────────

interface UpdateStyleProfileInput {
  name?: string
  rules?: string[]
}

export async function updateStyleProfileAction(
  id: string,
  input: UpdateStyleProfileInput,
): Promise<ActionResult<StyleProfile>> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  // Guard: fetch the profile first and verify ownership + mutability
  const { data: existing } = await supabase
    .from('style_profiles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) return { error: 'Style profile not found.' }
  if (isBuiltInProfile(existing as StyleProfile)) return { error: 'Built-in profiles cannot be edited.' }

  const updates: Record<string, unknown> = {}
  if (input.name !== undefined) {
    if (!input.name.trim()) return { error: 'Profile name is required.' }
    updates['name'] = input.name.trim()
  }
  if (input.rules !== undefined) {
    updates['rules'] = input.rules.filter((r) => r.trim().length > 0)
  }

  const { data, error } = await supabase
    .from('style_profiles')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) return { error: 'Failed to update style profile.' }

  return { data: data as StyleProfile }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteStyleProfileAction(id: string): Promise<ActionResult> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { data: existing } = await supabase
    .from('style_profiles')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) return { error: 'Style profile not found.' }
  if (isBuiltInProfile(existing as StyleProfile)) return { error: 'Built-in profiles cannot be deleted.' }

  const { error } = await supabase.from('style_profiles').delete().eq('id', id)
  if (error) return { error: 'Failed to delete style profile.' }

  return { data: undefined }
}

// ─── Set active ───────────────────────────────────────────────────────────────

export async function setActiveStyleProfileAction(profileId: string): Promise<ActionResult> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  // Verify the profile belongs to this user
  const { data: profile } = await supabase
    .from('style_profiles')
    .select('id')
    .eq('id', profileId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) return { error: 'Style profile not found.' }

  const { error } = await supabase
    .from('user_preferences')
    .update({ active_style_profile_id: profileId })
    .eq('user_id', user.id)

  if (error) return { error: 'Failed to update active profile.' }

  return { data: undefined }
}
