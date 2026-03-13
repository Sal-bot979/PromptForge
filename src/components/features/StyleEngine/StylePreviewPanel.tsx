import * as React from 'react'
import { MarkdownPreview, MarkdownStyles } from '@/components/features/ArtifactGeneration/MarkdownPreview'
import { cn } from '@/lib/utils'

// Sample content rendered in all three styles to demonstrate the difference
const SAMPLE_TOPIC = 'User Authentication'

const SAMPLE_CONTENT: Record<'structured' | 'narrative' | 'terse', string> = {
  structured: `## User Authentication

### Overview
The authentication system handles user identity verification and session management.

### Requirements
1. Support email + magic link sign-in
2. Support GitHub OAuth
3. Sessions persist for 7 days
4. Refresh tokens automatically on each request

### Acceptance Criteria
- [ ] User can sign in with email magic link in under 30 seconds
- [ ] User can sign in with GitHub OAuth
- [ ] Unauthenticated users are redirected to /login
- [ ] Sessions refresh automatically without user action

### Security Rules
- **Never** store passwords in plaintext
- **Always** validate sessions server-side
- Tokens must be invalidated on sign-out`,

  narrative: `## User Authentication

Authentication is the foundation of user trust. Our approach prioritizes both security and
simplicity — we want sign-in to feel effortless while ensuring that user data is protected
by default.

We've chosen magic links over passwords for a deliberate reason: passwords are the
single largest source of account compromise, and most users reuse them anyway. A magic
link delivered to a verified email address is both more secure and simpler for the user.
The tradeoff is that it requires email access, which we accept given our target audience
of technical builders who manage their email carefully.

GitHub OAuth is offered as a secondary path because many of our users already have strong
GitHub identities and would prefer to avoid adding another email-based account. It also
allows us to surface relevant information like public repositories in future phases.

Sessions are designed to stay out of the way. Seven-day persistence means users aren't
constantly re-authenticating during active work periods, while automatic token refresh
ensures the experience doesn't break mid-session.`,

  terse: `## Auth

**Strategy:** Magic link (primary) + GitHub OAuth (secondary). No passwords.

**Session:** 7d persistence. Auto-refresh on every request via middleware.

**Rules:**
- Server-side session validation on all protected routes
- Immediate token invalidation on sign-out
- Supabase RLS enforces data isolation per user_id

**Routes:** /login → unauthenticated, /dashboard → authenticated, /auth/callback → token exchange`,
}

interface StylePreviewPanelProps {
  onSelectStyle?: (styleType: 'structured' | 'narrative' | 'terse') => void
  className?: string
}

/**
 * Renders the same sample content in all three built-in styles side by side.
 *
 * Used on the /styles page to help users understand what each style produces.
 * "Select" CTA calls back to the parent to set the active profile.
 */
export function StylePreviewPanel({ onSelectStyle, className }: StylePreviewPanelProps) {
  const styles = ['structured', 'narrative', 'terse'] as const

  const labels = {
    structured: 'Structured',
    narrative: 'Narrative',
    terse: 'Terse',
  }

  const descriptions = {
    structured: 'Numbered lists, tables, checkboxes — optimized for developers following a spec.',
    narrative: 'Prose-driven reasoning — optimized for stakeholders reading the why.',
    terse: 'Dense, imperative, no filler — optimized for experienced engineers who hate prose.',
  }

  return (
    <>
      <MarkdownStyles />
      <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-4', className)}>
        {styles.map((styleType) => (
          <div key={styleType} className="flex flex-col rounded-forge-lg border border-[var(--color-border)] overflow-hidden">
            {/* Column header */}
            <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
              <p className="text-forge-sm font-semibold text-[var(--color-fg)]">{labels[styleType]}</p>
              <p className="text-forge-xs text-[var(--color-fg-muted)] mt-0.5">{descriptions[styleType]}</p>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 bg-[var(--color-surface)] overflow-y-auto max-h-[480px]">
              <MarkdownPreview content={SAMPLE_CONTENT[styleType]} />
            </div>

            {/* CTA */}
            {onSelectStyle && (
              <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
                <button
                  onClick={() => onSelectStyle(styleType)}
                  className={cn(
                    'w-full py-1.5 rounded-forge text-forge-sm font-medium transition-colors',
                    'border border-[var(--color-border)] text-[var(--color-fg-muted)]',
                    'hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]',
                    'hover:bg-[var(--color-accent-muted)]',
                  )}
                >
                  Use {labels[styleType]}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
