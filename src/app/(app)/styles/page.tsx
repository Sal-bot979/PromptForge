import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { listStyleProfilesAction } from './actions'
import { StyleStoreInitializer } from '@/components/features/StyleEngine'
import { StylesPageClient } from './StylesPageClient'

export const metadata: Metadata = {
  title: 'Style Profiles',
}

/**
 * Style Profiles management page.
 *
 * Server component: seeds built-ins if needed, loads profiles + active ID,
 * hydrates styleStore via StyleStoreInitializer, then hands off to the
 * interactive StylesPageClient.
 */
export default async function StylesPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [profilesResult, prefsResult] = await Promise.all([
    listStyleProfilesAction(),
    supabase
      .from('user_preferences')
      .select('active_style_profile_id')
      .eq('user_id', user!.id)
      .maybeSingle(),
  ])

  const profiles = 'data' in profilesResult ? profilesResult.data : []
  const activeProfileId = prefsResult.data?.active_style_profile_id ?? null

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-forge-2xl font-bold">Styles</h1>
        <p className="text-forge-sm text-[var(--color-fg-muted)] mt-1 max-w-xl">
          Style profiles control how PromptForge writes. Switch between Structured, Narrative, and
          Terse, or create your own with custom rules.
        </p>
      </div>

      {/* Hydrate styleStore from server-loaded profiles */}
      <StyleStoreInitializer profiles={profiles} activeProfileId={activeProfileId} />

      {/* Interactive profile grid + form */}
      <StylesPageClient />
    </div>
  )
}
