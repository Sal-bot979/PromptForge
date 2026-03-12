import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Root page: checks auth state and routes accordingly.
 * - Authenticated → /dashboard
 * - Unauthenticated → /login
 *
 * This page is purely a redirect — no UI rendered here.
 * Landing page content (marketing) will be added in Phase 10.
 */
export default async function RootPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
