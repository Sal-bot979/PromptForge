import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client using Next.js cookies for session management.
 *
 * Use this in:
 * - Server Components (async page/layout components)
 * - Route Handlers (`src/app/api/`)
 * - Server Actions
 *
 * Never use this in Client Components — use `createClient` from `./client` instead.
 * The cookies() call requires a Server Component or Route Handler context.
 *
 * @example
 * // In a Server Component
 * import { createServerClient } from '@/lib/supabase/server'
 *
 * export default async function DashboardPage() {
 *   const supabase = await createServerClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *   ...
 * }
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll is called from Server Components where cookies cannot be set.
            // If you have middleware refreshing user sessions, this can be ignored.
          }
        },
      },
    },
  )
}
