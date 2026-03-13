'use client'

import * as React from 'react'
import { useIntakeStore, GUIDED_STEPS, type GuidedStepKey } from '@/store/intakeStore'
import { ForgeButton } from '@/components/forge/ForgeButton'
import { ForgeTextField } from '@/components/forge/ForgeTextField'
import { ForgeTextEditor } from '@/components/forge/ForgeTextEditor'
import { cn } from '@/lib/utils'

const STEP_CONFIG: Record<GuidedStepKey, { placeholder: string; multiline: boolean; hint: string }> = {
  concept: {
    placeholder: "e.g. A web app that lets freelancers track time and generate invoices automatically",
    multiline: false,
    hint: "1–2 sentences. What does it do and what problem does it solve?",
  },
  users: {
    placeholder: "e.g. Freelance designers\nSolo consultants who bill hourly",
    multiline: true,
    hint: "One per line. Be specific about their role and technical level.",
  },
  goals: {
    placeholder: "e.g. Reduce time creating invoices by 80%\nEliminate forgotten billable hours",
    multiline: true,
    hint: "One per line. Prefer measurable outcomes over vague aspirations.",
  },
  constraints: {
    placeholder: "e.g. Must work offline on mobile\nNo external backend (Supabase only)\nLaunch in 6 weeks",
    multiline: true,
    hint: "One per line. Include platform, budget, timeline, compliance. Leave blank if none.",
  },
  tech_stack: {
    placeholder: "e.g. Next.js 15, Supabase, Stripe, Tailwind CSS, Vercel",
    multiline: false,
    hint: "Comma-separated. List every framework, library, and platform you plan to use.",
  },
  deployment: {
    placeholder: "e.g. Vercel-hosted Next.js web app with Supabase PostgreSQL and Stripe payments",
    multiline: false,
    hint: "One sentence describing where and how it runs.",
  },
}

/**
 * Step-by-step guided intake wizard.
 *
 * Each step maps to one field in ProjectSpec. Navigation is linear (Back/Next).
 * On every step change, commitGuidedSpec() syncs the guided values to the
 * structured spec so the SpecPreviewPanel stays up to date.
 */
export function GuidedIntakeForm() {
  const guidedStep = useIntakeStore((s) => s.guidedStep)
  const guidedValues = useIntakeStore((s) => s.guidedValues)
  const nextGuidedStep = useIntakeStore((s) => s.nextGuidedStep)
  const prevGuidedStep = useIntakeStore((s) => s.prevGuidedStep)
  const setGuidedValue = useIntakeStore((s) => s.setGuidedValue)
  const commitGuidedSpec = useIntakeStore((s) => s.commitGuidedSpec)

  const currentStep = GUIDED_STEPS[guidedStep]
  if (!currentStep) return null

  const config = STEP_CONFIG[currentStep.key]
  const currentValue = guidedValues[currentStep.key]
  const isFirst = guidedStep === 0
  const isLast = guidedStep === GUIDED_STEPS.length - 1

  function handleNext() {
    commitGuidedSpec()
    nextGuidedStep()
  }

  function handleBack() {
    commitGuidedSpec()
    prevGuidedStep()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2" aria-label="Step progress">
        {GUIDED_STEPS.map((step, i) => (
          <React.Fragment key={step.key}>
            <div
              className={cn(
                'flex items-center justify-center w-7 h-7 rounded-full text-forge-xs font-semibold',
                'border transition-all',
                i < guidedStep && 'bg-[var(--color-accent)] border-[var(--color-accent)] text-[#0a0a0b]',
                i === guidedStep && 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-muted)]',
                i > guidedStep && 'border-[var(--color-border)] text-[var(--color-fg-subtle)]',
              )}
              aria-label={`Step ${i + 1}: ${step.label}${i < guidedStep ? ' (completed)' : i === guidedStep ? ' (current)' : ''}`}
            >
              {i < guidedStep ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < GUIDED_STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px transition-colors',
                  i < guidedStep ? 'bg-[var(--color-accent)]/40' : 'bg-[var(--color-border)]',
                )}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step label */}
      <div>
        <h3 className="text-forge-lg font-semibold mb-1">
          {guidedStep + 1}. {currentStep.label}
        </h3>
        <p className="text-forge-sm text-[var(--color-fg-muted)]">{currentStep.description}</p>
      </div>

      {/* Input */}
      {config.multiline ? (
        <ForgeTextEditor
          label={currentStep.label}
          placeholder={config.placeholder}
          value={currentValue}
          onChange={(e) => setGuidedValue(currentStep.key, e.target.value)}
          rows={5}
          hint={config.hint}
          autoGrow
          maxRows={12}
        />
      ) : (
        <ForgeTextField
          label={currentStep.label}
          placeholder={config.placeholder}
          value={currentValue}
          onChange={(e) => setGuidedValue(currentStep.key, e.target.value)}
          hint={config.hint}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <ForgeButton variant="ghost" onClick={handleBack} disabled={isFirst}>
          ← Back
        </ForgeButton>

        <span className="text-forge-xs text-[var(--color-fg-subtle)]">
          {guidedStep + 1} / {GUIDED_STEPS.length}
        </span>

        {!isLast ? (
          <ForgeButton variant="secondary" onClick={handleNext}>
            Next →
          </ForgeButton>
        ) : (
          <ForgeButton variant="primary" onClick={handleNext}>
            Review Spec →
          </ForgeButton>
        )}
      </div>
    </div>
  )
}
