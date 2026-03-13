import type { Metadata } from 'next'
import { ProjectIntakeForm } from '@/components/features/ProjectIntake'

export const metadata: Metadata = {
  title: 'New Project',
}

/**
 * New project intake page.
 *
 * Renders the full two-column intake UI:
 * - Left: freeform description or guided wizard
 * - Right: real-time structured spec preview
 * - Bottom: project name, tags, and "Create Project" action
 *
 * All state is managed client-side via intakeStore (Zustand).
 * createProjectAction is called from ProjectSummaryView and redirects to /dashboard.
 */
export default function NewProjectPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-forge-2xl font-bold">New Project</h1>
        <p className="text-forge-sm text-[var(--color-fg-muted)] mt-1">
          Describe your project once. PromptForge generates your complete workflow.
        </p>
      </div>

      <ProjectIntakeForm />
    </div>
  )
}
