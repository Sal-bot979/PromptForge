'use client'

import * as React from 'react'
import { useIntakeStore } from '@/store/intakeStore'
import { StatusChip } from '@/components/forge/StatusChip'
import { cn } from '@/lib/utils'

/**
 * Real-time structured spec preview panel.
 *
 * Renders the current state of the extracted/guided ProjectSpec.
 * Shows skeleton loaders while extraction is in progress.
 * Each field is labeled clearly so users can immediately see what was extracted.
 */
export function SpecPreviewPanel() {
  const spec = useIntakeStore((s) => s.spec)
  const isExtracting = useIntakeStore((s) => s.isExtracting)

  const hasAnyContent = spec.concept || (spec.users?.length ?? 0) > 0 ||
    (spec.goals?.length ?? 0) > 0 || spec.deployment

  if (!hasAnyContent && !isExtracting) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center px-6">
        <div className="w-12 h-12 rounded-forge-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-[var(--color-fg-subtle)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-forge-sm text-[var(--color-fg-muted)] font-medium mb-1">
          Structured spec will appear here
        </p>
        <p className="text-forge-xs text-[var(--color-fg-subtle)]">
          Describe your project and click "Extract Structure", or fill in the guided form.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-1">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-forge-sm font-semibold text-[var(--color-fg-muted)] uppercase tracking-wider">
          Structured Spec
        </h3>
        {isExtracting && (
          <StatusChip status="generating" showDot>
            Extracting…
          </StatusChip>
        )}
      </div>

      <SpecField
        label="Concept"
        isLoading={isExtracting && !spec.concept}
        isEmpty={!spec.concept}
      >
        <p className="text-forge-sm text-[var(--color-fg)] leading-relaxed">{spec.concept}</p>
      </SpecField>

      <SpecField
        label="Target Users"
        isLoading={isExtracting && (!spec.users || spec.users.length === 0)}
        isEmpty={!spec.users || spec.users.length === 0}
      >
        <ul className="space-y-1">
          {spec.users?.map((user, i) => (
            <li key={i} className="flex items-start gap-2 text-forge-sm text-[var(--color-fg)]">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] flex-shrink-0" aria-hidden="true" />
              {user}
            </li>
          ))}
        </ul>
      </SpecField>

      <SpecField
        label="Goals"
        isLoading={isExtracting && (!spec.goals || spec.goals.length === 0)}
        isEmpty={!spec.goals || spec.goals.length === 0}
      >
        <ul className="space-y-1">
          {spec.goals?.map((goal, i) => (
            <li key={i} className="flex items-start gap-2 text-forge-sm text-[var(--color-fg)]">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] flex-shrink-0" aria-hidden="true" />
              {goal}
            </li>
          ))}
        </ul>
      </SpecField>

      <SpecField
        label="Tech Stack"
        isLoading={isExtracting && (!spec.tech_stack || spec.tech_stack.length === 0)}
        isEmpty={!spec.tech_stack || spec.tech_stack.length === 0}
        optional
      >
        <div className="flex flex-wrap gap-1.5">
          {spec.tech_stack?.map((tech) => (
            <StatusChip key={tech} variant="accent">{tech}</StatusChip>
          ))}
        </div>
      </SpecField>

      <SpecField
        label="Constraints"
        isLoading={isExtracting && (!spec.constraints || spec.constraints.length === 0)}
        isEmpty={!spec.constraints || spec.constraints.length === 0}
        optional
      >
        <ul className="space-y-1">
          {spec.constraints?.map((c, i) => (
            <li key={i} className="text-forge-sm text-[var(--color-fg-muted)]">{c}</li>
          ))}
        </ul>
      </SpecField>

      <SpecField
        label="Deployment"
        isLoading={isExtracting && !spec.deployment}
        isEmpty={!spec.deployment}
      >
        <p className="text-forge-sm text-[var(--color-fg)]">{spec.deployment}</p>
      </SpecField>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SpecFieldProps {
  label: string
  isLoading: boolean
  isEmpty: boolean
  optional?: boolean
  children: React.ReactNode
}

function SpecField({ label, isLoading, isEmpty, optional = false, children }: SpecFieldProps) {
  if (isEmpty && !isLoading) {
    if (optional) return null
    return (
      <div className="py-1">
        <p className="text-forge-xs font-medium text-[var(--color-fg-subtle)] uppercase tracking-wide mb-1.5">
          {label}
        </p>
        <p className="text-forge-xs text-[var(--color-fg-subtle)] italic">Not detected</p>
      </div>
    )
  }

  return (
    <div className="py-1 animate-[fadeIn_0.3s_ease-in-out]">
      <p className="text-forge-xs font-medium text-[var(--color-fg-subtle)] uppercase tracking-wide mb-1.5">
        {label}
      </p>
      {isLoading ? (
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      ) : (
        children
      )}
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded bg-[var(--color-surface-2)] animate-pulse',
        className,
      )}
      aria-hidden="true"
    />
  )
}
