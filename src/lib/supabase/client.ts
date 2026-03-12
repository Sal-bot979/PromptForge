import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client singleton.
 *
 * Use this in Client Components (`"use client"`) for:
 * - Reading data with optimistic updates
 * - Real-time subscriptions
 * - Auth state changes (onAuthStateChange)
 *
 * Never use this in Server Components or Route Handlers — use `createServerClient` instead.
 *
 * @example
 * "use client"
 * import { createClient } from '@/lib/supabase/client'
 *
 * const supabase = createClient()
 * const { data } = await supabase.from('projects').select('*')
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
