import type { SupabaseClient } from '@supabase/supabase-js'
import type { StyleProfileInsert } from '@/types'

/**
 * Definitions for the three built-in style profiles.
 *
 * These are seeded for every new user and cannot be edited or deleted.
 * The `style_type` field matches the enum in the database and the
 * styleInstructions map in src/lib/claude/prompts/styleInstructions.ts.
 */
export const BUILT_IN_PROFILES: Omit<StyleProfileInsert, 'user_id'>[] = [
  {
    name: 'Structured',
    style_type: 'structured',
    is_default: true,
    rules: [
      'Use numbered lists for all sequences, phases, and ordered steps',
      'Use bullet points for non-sequential items',
      'Use tables for comparisons and multi-attribute data',
      'Use headers (## and ###) to delineate every section clearly',
      'Use checkboxes (- [ ]) for action items and acceptance criteria',
      'Keep paragraphs short — 3 to 4 sentences maximum',
      'Bold key terms on first use and for critical warnings',
    ],
    learned_overrides: [],
  },
  {
    name: 'Narrative',
    style_type: 'narrative',
    is_default: false,
    rules: [
      'Lead with context and reasoning before stating conclusions',
      'Use full paragraphs instead of bullet points wherever possible',
      'Explain trade-offs conversationally: why a decision was made and its downsides',
      'Use section headers sparingly — let the prose carry the structure',
      'Reserve bullet points for genuinely enumerable information',
      'Write as if explaining to a smart colleague, not filling out a form',
      'Each section should flow naturally into the next',
    ],
    learned_overrides: [],
  },
  {
    name: 'Terse',
    style_type: 'terse',
    is_default: false,
    rules: [
      'Use as few words as possible without losing critical information',
      'Prefer imperative form: "Use X" not "You should consider using X"',
      'No preamble, no transitions, no pleasantries',
      'Omit Introduction, Overview, and Conclusion sections unless essential',
      'Every sentence must carry information — remove all filler',
      'Use abbreviations and technical shorthand freely',
      'Tables and code blocks are preferred over prose explanations',
    ],
    learned_overrides: [],
  },
]

/**
 * Seeds the three built-in style profiles for a user if they don't already have them.
 *
 * Safe to call on every `/styles` page load — checks first, inserts only if missing.
 *
 * @param supabase - An authenticated Supabase client (server-side)
 * @param userId - The authenticated user's ID
 * @returns The user's full list of style profiles after seeding
 */
export async function seedBuiltInStyleProfiles(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  // Check how many profiles this user already has
  const { count } = await supabase
    .from('style_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Already seeded — nothing to do
  if ((count ?? 0) > 0) return

  const toInsert: StyleProfileInsert[] = BUILT_IN_PROFILES.map((p) => ({
    ...p,
    user_id: userId,
  }))

  const { error } = await supabase.from('style_profiles').insert(toInsert)

  if (error && process.env.NODE_ENV === 'development') {
    console.error('[seedBuiltInStyleProfiles] Failed:', error)
  }
}
