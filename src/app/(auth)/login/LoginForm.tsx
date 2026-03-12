'use client'

import * as React from 'react'
import { createClient } from '@/lib/supabase/client'
import { ForgeButton } from '@/components/forge/ForgeButton'
import { ForgeTextField } from '@/components/forge/ForgeTextField'
import { ForgeCard } from '@/components/forge/ForgeCard'

type AuthMode = 'magic_link' | 'password'

/**
 * Login form supporting both magic link (email) and password auth.
 * Defaults to magic link — the recommended flow for PromptForge.
 */
export function LoginForm() {
  const supabase = createClient()
  const [email, setEmail] = React.useState('')
  const [mode, setMode] = React.useState<AuthMode>('magic_link')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSent, setIsSent] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (mode === 'magic_link') {
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          },
        })
        if (authError) throw authError
        setIsSent(true)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <ForgeCard>
        <div className="text-center py-2">
          <div className="text-2xl mb-3">✉️</div>
          <h2 className="text-forge-base font-semibold mb-2">Check your email</h2>
          <p className="text-forge-sm text-[var(--color-fg-muted)]">
            We sent a magic link to <span className="text-[var(--color-fg)]">{email}</span>.
            Click the link to sign in.
          </p>
          <button
            onClick={() => { setIsSent(false); setEmail('') }}
            className="mt-4 text-forge-xs text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)] underline"
          >
            Use a different email
          </button>
        </div>
      </ForgeCard>
    )
  }

  return (
    <ForgeCard>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ForgeTextField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          autoComplete="email"
          error={error ?? undefined}
        />

        <ForgeButton
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          {isLoading ? 'Sending link...' : 'Send magic link'}
        </ForgeButton>
      </form>

      <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
        <p className="text-center text-forge-xs text-[var(--color-fg-subtle)]">
          No password needed — we&apos;ll email you a secure sign-in link.
        </p>
      </div>
    </ForgeCard>
  )
}
