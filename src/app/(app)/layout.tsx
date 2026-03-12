import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/features/AppSidebar'

/**
 * Authenticated app shell layout.
 *
 * All routes under (app)/ require authentication.
 * Unauthenticated users are redirected to /login by middleware,
 * but we double-check here as a defense-in-depth measure.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar user={user} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
