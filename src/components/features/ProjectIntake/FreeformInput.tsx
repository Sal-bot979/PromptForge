'use client'

import * as React from 'react'
import { useIntakeStore, runExtraction } from '@/store/intakeStore'
import { ForgeTextEditor } from '@/components/forge/ForgeTextEditor'
import { ForgeButton } from '@/components/forge/ForgeButton'
import { cn } from '@/lib/utils'

const EXAMPLE_PROMPTS = [
  {
    label: 'SaaS app',
    text: 'A subscription-based web app for freelancers to track their time and automatically generate invoices. Users log hours against projects, set hourly rates, and the app creates PDF invoices they can email directly to clients. Built with Next.js, Supabase, and Stripe.',
  },
  {
    label: 'CLI tool',
    text: 'A command-line tool for developers to manage multiple .env files across projects. It encrypts secrets with a master password, lets you switch between environments instantly, and syncs with a team vault so everyone on the team always has the latest values.',
  },
  {
    label: 'Mobile app',
    text: 'An iOS habit tracker that uses AI to analyze your streak patterns and suggest the optimal time of day to do each habit based on when you historically succeed. Uses HealthKit for sleep data correlation. SwiftUI with a local-first SQLite database.',
  },
]

const MIN_DESCRIPTION_LENGTH = 50

/**
 * Freeform project description input with one-click Claude extraction.
 *
 * Shows example prompt chips to help users understand the level of detail needed.
 * "Extract Structure" is disabled until the description is substantive (50+ chars).
 */
export function FreeformInput() {
  const description = useIntakeStore((s) => s.description)
  const isExtracting = useIntakeStore((s) => s.isExtracting)
  const extractionError = useIntakeStore((s) => s.extractionError)
  const setDescription = useIntakeStore((s) => s.setDescription)
  const store = useIntakeStore()

  const abortRef = React.useRef<AbortController | null>(null)

  const canExtract = description.trim().length >= MIN_DESCRIPTION_LENGTH && !isExtracting

  function handleExtract() {
    abortRef.current = new AbortController()
    void runExtraction(description, store, abortRef.current.signal)
  }

  function handleCancel() {
    abortRef.current?.abort()
  }

  function handleExampleClick(text: string) {
    setDescription(text)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Example prompt chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-forge-xs text-[var(--color-fg-subtle)] self-center mr-1">Try an example:</span>
        {EXAMPLE_PROMPTS.map((ex) => (
          <button
            key={ex.label}
            onClick={() => handleExampleClick(ex.text)}
            className={cn(
              'px-3 py-1 rounded-full text-forge-xs border transition-colors',
              'border-[var(--color-border)] text-[var(--color-fg-muted)]',
              'hover:border-[var(--color-accent)]/50 hover:text-[var(--color-accent)]',
              'hover:bg-[var(--color-accent-muted)]',
            )}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Description textarea */}
      <ForgeTextEditor
        label="Project Description"
        placeholder={`Describe your project naturally — what it does, who uses it, what tech you'll use, how it deploys.\n\nThe more detail you provide, the better the extraction.`}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={10}
        showCounts
        autoGrow
        maxRows={24}
        hint={
          description.length < MIN_DESCRIPTION_LENGTH && description.length > 0
            ? `Add ${MIN_DESCRIPTION_LENGTH - description.length} more characters to enable extraction`
            : undefined
        }
      />

      {/* Error */}
      {extractionError && (
        <div className="px-3 py-2 rounded-forge border border-[var(--color-error)]/30 bg-red-950/20">
          <p className="text-forge-sm text-[var(--color-error)]">{extractionError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <ForgeButton
          variant="primary"
          onClick={handleExtract}
          disabled={!canExtract}
          isLoading={isExtracting}
        >
          {isExtracting ? 'Extracting…' : 'Extract Structure'}
        </ForgeButton>

        {isExtracting && (
          <ForgeButton variant="ghost" onClick={handleCancel} size="sm">
            Cancel
          </ForgeButton>
        )}

        {!isExtracting && description.trim().length >= MIN_DESCRIPTION_LENGTH && (
          <p className="text-forge-xs text-[var(--color-fg-subtle)]">
            Claude will extract your concept, users, goals, constraints, tech stack, and deployment target.
          </p>
        )}
      </div>
    </div>
  )
}
