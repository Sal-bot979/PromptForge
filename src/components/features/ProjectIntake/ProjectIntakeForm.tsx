'use client'

import * as React from 'react'
import { useIntakeStore, type IntakeMode } from '@/store/intakeStore'
import { FreeformInput } from './FreeformInput'
import { GuidedIntakeForm } from './GuidedIntakeForm'
import { SpecPreviewPanel } from './SpecPreviewPanel'
import { ProjectSummaryView } from './ProjectSummaryView'
import { cn } from '@/lib/utils'

const MODE_TABS: { mode: IntakeMode; label: string; description: string }[] = [
  {
    mode: 'freeform',
    label: 'Freeform',
    description: 'Describe your project naturally — Claude extracts the structure',
  },
  {
    mode: 'guided',
    label: 'Guided',
    description: 'Answer 6 focused questions step by step',
  },
]

/**
 * Root intake form component.
 *
 * Layout:
 * - Mode tabs (Freeform / Guided) at the top
 * - Two-column layout: left = input, right = spec preview
 * - Summary + Create panel appears below once spec has a concept
 */
export function ProjectIntakeForm() {
  const mode = useIntakeStore((s) => s.mode)
  const spec = useIntakeStore((s) => s.spec)
  const isExtracting = useIntakeStore((s) => s.isExtracting)
  const setMode = useIntakeStore((s) => s.setMode)

  const showSummary = Boolean(spec.concept) || Boolean(spec.goals?.length)

  return (
    <div className="flex flex-col gap-6">
      {/* Mode tabs */}
      <div className="flex gap-1 p-1 rounded-forge-md bg-[var(--color-surface-2)] border border-[var(--color-border)] w-fit">
        {MODE_TABS.map(({ mode: m, label }) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'px-4 py-2 rounded-forge text-forge-sm font-medium transition-all',
              mode === m
                ? 'bg-[var(--color-surface)] text-[var(--color-fg)] shadow-forge-sm'
                : 'text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]',
            )}
            aria-pressed={mode === m}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Mode description */}
      <p className="text-forge-sm text-[var(--color-fg-muted)] -mt-3">
        {MODE_TABS.find((t) => t.mode === mode)?.description}
      </p>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: input */}
        <div className="min-w-0">
          {mode === 'freeform' ? <FreeformInput /> : <GuidedIntakeForm />}
        </div>

        {/* Right: spec preview */}
        <div
          className={cn(
            'rounded-forge-lg border border-[var(--color-border)] bg-[var(--color-surface)]',
            'min-h-[400px] overflow-y-auto',
            !showSummary && !isExtracting ? 'flex items-center' : 'p-4',
          )}
        >
          <SpecPreviewPanel />
        </div>
      </div>

      {/* Summary + Create — appears once we have something to show */}
      {showSummary && (
        <div className="mt-2 animate-[slideUp_0.3s_ease-out]">
          <ProjectSummaryView />
        </div>
      )}
    </div>
  )
}
