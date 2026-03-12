/**
 * Claude API streaming client for PromptForge.
 *
 * IMPORTANT: This module is server-side only. It imports the Anthropic SDK and
 * uses ANTHROPIC_API_KEY. Never import this in Client Components or any file
 * that could end up in the client bundle.
 *
 * Pattern: compilePrompt() → streamGeneration() → ReadableStream (SSE)
 * The Route Handler pipes this stream directly to the HTTP response.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { GenerateRequest, StreamChunkPayload } from './types'
import { CLAUDE_MODEL, MAX_TOKENS } from './types'
import { compilePrompt } from './prompts/compiler'

// Lazily initialized to avoid errors when env var is not set during build
let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

/**
 * Streams a Claude artifact generation as a ReadableStream of newline-delimited JSON.
 *
 * Each chunk is a JSON-stringified `StreamChunkPayload`.
 * The stream ends with a `{ type: 'done' }` chunk or `{ type: 'error', error: string }`.
 *
 * @example
 * // In a Route Handler:
 * const stream = await streamGeneration(requestBody)
 * return new Response(stream, {
 *   headers: { 'Content-Type': 'text/event-stream' }
 * })
 */
export async function streamGeneration(request: GenerateRequest): Promise<ReadableStream<Uint8Array>> {
  const { systemPrompt, userPrompt } = compilePrompt(request)
  const client = getClient()

  const encoder = new TextEncoder()

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const stream = await client.messages.stream({
          model: CLAUDE_MODEL,
          max_tokens: MAX_TOKENS,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        })

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const chunk: StreamChunkPayload = {
              type: 'delta',
              content: event.delta.text,
            }
            controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'))
          }
        }

        // Signal completion
        const doneChunk: StreamChunkPayload = { type: 'done' }
        controller.enqueue(encoder.encode(JSON.stringify(doneChunk) + '\n'))
        controller.close()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error during generation'
        const errorChunk: StreamChunkPayload = { type: 'error', error: errorMessage }
        controller.enqueue(encoder.encode(JSON.stringify(errorChunk) + '\n'))
        controller.close()
      }
    },
  })

  return readable
}

/**
 * Client-side utility for consuming a streaming generation response.
 *
 * Parses the newline-delimited JSON chunks from /api/generate and calls
 * the provided callbacks as content arrives.
 *
 * @example
 * await consumeGenerationStream('/api/generate', requestBody, {
 *   onDelta: (text) => setContent((prev) => prev + text),
 *   onDone: () => setStatus('complete'),
 *   onError: (err) => setError(err),
 * })
 */
export async function consumeGenerationStream(
  url: string,
  body: GenerateRequest,
  callbacks: {
    onDelta: (text: string) => void
    onDone: () => void
    onError: (error: string) => void
  },
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
    callbacks.onError((errorData as { error?: string }).error ?? 'Generation request failed')
    return
  }

  if (!response.body) {
    callbacks.onError('No response body received')
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    // Keep the last (potentially incomplete) line in the buffer
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const chunk = JSON.parse(line) as StreamChunkPayload
        if (chunk.type === 'delta' && chunk.content) {
          callbacks.onDelta(chunk.content)
        } else if (chunk.type === 'done') {
          callbacks.onDone()
        } else if (chunk.type === 'error') {
          callbacks.onError(chunk.error ?? 'Unknown error')
        }
      } catch {
        // Malformed JSON line — skip and continue
      }
    }
  }
}
