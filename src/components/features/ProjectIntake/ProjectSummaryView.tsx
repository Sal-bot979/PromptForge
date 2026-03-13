'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useIntakeStore } from '@/store/intakeStore'
import { ForgeButton } from '@/components/forge/ForgeButton'
import { ForgeTextField } from '@/components/forge/ForgeTextField'
import { ForgeCard } from '@/components/forge/ForgeCard'
import { StatusChip } from '@/components/forge/StatusChip'
import { createProjectAction } from '@/app/(app)/new-project/actions'

/**
 * Final review step before project creation.
 *
 * Shows the extracted/guided spec, lets the user set a project name and tags,
 * and submits via `createProjectAction`.
 */
export function ProjectSummaryView() {
  const router = useRouter()
  const spec = useIntakeStore((s) => s.spec)
  const projectName = useIntakeStore((s) => s.projectName)
  const projectTags = useIntakeStore((s) => s.projectTags)
  const similarProject = useIntakeStore((s) => s.similarProject)
  const setProjectName = useIntakeStore((s) => s.setProjectName)
  const setProjectTags = useIntakeStore((s) => s.setProjectTags)
  const description = useIntakeStore((s) => s.description)
  const reset = useIntakeStore((s) => s.reset)

  const [isCreating, setIsCreating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [tagInput, setTagInput] = React.useState('')

  const hasSpec = Boolean(spec.concept || (spec.goals?.length ?? 0) > 0)

  async function handleCreate() {
    if (!projectName.trim()) {
      setError('Project name is required.')
      return
    }
    setError(null)
    setIsCreating(true)

    try {
      const result = await createProjectAction({
        name: projectName.trim(),
        description,
        structuredSpec: hasSpec ? spec : null,
        tags: projectTags,
      })

      if ('error' in result) {
        setError(result.error)
        return
      }

      reset()
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      if (tag && !projectTags.includes(tag)) {
        setProjectTags([...projectTags, tag])
      }
      setTagInput('')
    } else if (e.key === 'Backspace' && tagInput === '' && projectTags.length > 0) {
      setProjectTags(projectTags.slice(0, -1))
    }
  }

  function removeTag(tag: string) {
    setProjectTags(projectTags.filter((t) => t !== tag))
  }

  return (
    <ForgeCard className="flex flex-col gap-5">
      <div>
        <h2 className="text-forge-lg font-semibold mb-1">Review & Create</h2>
        <p className="text-forge-sm text-[var(--color-fg-muted)]">
          Name your project and confirm the details before creating.
        </p>
      </div>

      {/* Similarity warning */}
      {similarProject && (
        <div className="px-3 py-2.5 rounded-forge border border-[var(--color-warning)]/30 bg-orange-950/20">
          <p className="text-forge-sm text-[var(--color-warning)]">
            Similar project detected:{' '}
            <a href={`/project/${similarProject.id}`} className="underline font-medium">
              {similarProject.name}
            </a>
            . Consider importing its context instead.
          </p>
        </div>
      )}

      {/* Project name */}
      <ForgeTextField
        label="Project Name"
        placeholder="My AI App"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        required
        autoFocus
        error={error && !projectName.trim() ? 'Project name is required' : undefined}
      />

      {/* Tags */}
      <div className="flex flex-col gap-1.5">
        <label className="text-forge-sm font-medium text-[var(--color-fg-muted)]">
          Tags <span className="text-[var(--color-fg-subtle)] font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-1.5 p-2 rounded-forge border border-[var(--color-border)] bg-[var(--color-surface-3)] min-h-[38px]">
          {projectTags.map((tag) => (
            <StatusChip key={tag} variant="default" className="cursor-default">
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] transition-colors"
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            </StatusChip>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={projectTags.length === 0 ? 'Add tags (press Enter)' : ''}
            className="flex-1 min-w-[120px] bg-transparent text-forge-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] outline-none"
          />
        </div>
        <p className="text-forge-xs text-[var(--color-fg-subtle)]">
          Press Enter or comma to add a tag. Auto-suggest from tech stack in Phase 6.
        </p>
      </div>

      {/* Spec summary */}
      {hasSpec && (
        <div className="rounded-forge border border-[var(--color-border)] p-3 bg-[var(--color-surface)] space-y-2">
          {spec.concept && (
            <p className="text-forge-sm text-[var(--color-fg)]">{spec.concept}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {spec.tech_stack?.map((t) => (
              <StatusChip key={t} variant="accent">{t}</StatusChip>
            ))}
          </div>
          <p className="text-forge-xs text-[var(--color-fg-subtle)]">
            {(spec.goals?.length ?? 0)} goals · {(spec.users?.length ?? 0)} user types
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-forge-sm text-[var(--color-error)]" role="alert">{error}</p>
      )}

      {/* Create button */}
      <ForgeButton
        variant="primary"
        size="lg"
        onClick={handleCreate}
        isLoading={isCreating}
        disabled={!projectName.trim()}
        className="w-full"
      >
        {isCreating ? 'Creating project…' : 'Create Project'}
      </ForgeButton>
    </ForgeCard>
  )
}
