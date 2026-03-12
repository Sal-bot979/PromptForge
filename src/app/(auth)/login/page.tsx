import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Wordmark */}
        <div className="mb-8 text-center">
          <h1 className="text-forge-3xl font-bold tracking-tight">
            Prompt<span className="text-[var(--color-accent)]">Forge</span>
          </h1>
          <p className="mt-2 text-forge-sm text-[var(--color-fg-muted)]">
            Describe once. Deploy everywhere.
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-forge-xs text-[var(--color-fg-subtle)]">
          By signing in, you agree to our{' '}
          <a href="/privacy" className="underline hover:text-[var(--color-fg-muted)]">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  )
}
