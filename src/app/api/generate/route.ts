import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { streamGeneration } from '@/lib/claude/client'
import type { GenerateRequest } from '@/lib/claude/types'

/**
 * POST /api/generate
 *
 * Streams an artifact generation from the Claude API.
 *
 * Request body: GenerateRequest
 * Response: text/event-stream — newline-delimited JSON (StreamChunkPayload)
 *
 * Auth: requires authenticated Supabase session.
 * Rate limiting: checks monthly_gen_count for free tier users (50/month limit).
 */
export async function POST(request: Request) {
  // Authenticate the request
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse and validate the request body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const generateRequest = validateGenerateRequest(body)
  if (!generateRequest) {
    return NextResponse.json(
      { error: 'Invalid request body. artifactType and projectContext.name are required.' },
      { status: 400 },
    )
  }

  // Check generation quota for free tier (Phase 6 will add plan-based limits)
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('monthly_gen_count, gen_count_month')
    .eq('user_id', user.id)
    .single()

  if (prefs) {
    const currentMonth = new Date().toISOString().slice(0, 7) // "YYYY-MM"
    const isNewMonth = prefs.gen_count_month !== currentMonth
    const genCount = isNewMonth ? 0 : prefs.monthly_gen_count

    // Free tier: 50 generations/month
    // TODO Phase 6: check subscription plan for higher limits
    const FREE_TIER_LIMIT = 50
    if (genCount >= FREE_TIER_LIMIT && !isNewMonth) {
      return NextResponse.json(
        {
          error: `Monthly generation limit reached (${FREE_TIER_LIMIT} generations). Upgrade to Builder for 500/month.`,
        },
        { status: 429 },
      )
    }

    // Increment the counter (fire and forget — don't block the stream)
    supabase
      .from('user_preferences')
      .update({
        monthly_gen_count: isNewMonth ? 1 : genCount + 1,
        gen_count_month: currentMonth,
      })
      .eq('user_id', user.id)
      .then(({ error }) => {
        if (error && process.env.NODE_ENV === 'development') {
          console.error('[/api/generate] Failed to update gen count:', error)
        }
      })
  }

  // Stream the generation
  try {
    const stream = await streamGeneration(generateRequest)
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable Nginx buffering on Vercel
      },
    })
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[/api/generate] Generation failed:', err)
    }
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}

function validateGenerateRequest(body: unknown): GenerateRequest | null {
  if (typeof body !== 'object' || body === null) return null

  const b = body as Record<string, unknown>

  if (typeof b['artifactType'] !== 'string') return null
  if (typeof b['projectContext'] !== 'object' || b['projectContext'] === null) return null

  const ctx = b['projectContext'] as Record<string, unknown>
  if (typeof ctx['name'] !== 'string' || ctx['name'].trim().length === 0) return null

  // Minimal validation — TypeScript handles the rest at compile time
  return body as GenerateRequest
}
