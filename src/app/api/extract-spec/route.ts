import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase/server'
import { EXTRACT_SPEC_SYSTEM_PROMPT, buildExtractSpecPrompt } from '@/lib/claude/prompts/extractSpec'
import { CLAUDE_MODEL, MAX_TOKENS } from '@/lib/claude/types'
import type { StreamChunkPayload } from '@/lib/claude/types'

/**
 * POST /api/extract-spec
 *
 * Streams a structured ProjectSpec extraction from a freeform project description.
 *
 * Request body: { description: string }
 * Response: text/event-stream — newline-delimited JSON (StreamChunkPayload).
 *           Deltas accumulate into a valid JSON string (ProjectSpec).
 *           Client should parse the full accumulated string on the 'done' event.
 *
 * Auth: requires authenticated Supabase session.
 */
export async function POST(request: Request) {
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Request body must be an object' }, { status: 400 })
  }

  const { description } = body as Record<string, unknown>

  if (typeof description !== 'string' || description.trim().length < 10) {
    return NextResponse.json(
      { error: 'description must be a string with at least 10 characters' },
      { status: 400 },
    )
  }

  if (description.length > 10000) {
    return NextResponse.json(
      { error: 'description must be under 10,000 characters' },
      { status: 400 },
    )
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const claudeStream = await client.messages.stream({
          model: CLAUDE_MODEL,
          max_tokens: MAX_TOKENS,
          system: EXTRACT_SPEC_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: buildExtractSpecPrompt(description) }],
        })

        for await (const event of claudeStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const chunk: StreamChunkPayload = { type: 'delta', content: event.delta.text }
            controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'))
          }
        }

        const done: StreamChunkPayload = { type: 'done' }
        controller.enqueue(encoder.encode(JSON.stringify(done) + '\n'))
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Extraction failed'
        const error: StreamChunkPayload = { type: 'error', error: msg }
        controller.enqueue(encoder.encode(JSON.stringify(error) + '\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
