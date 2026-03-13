'use client'

import * as React from 'react'
import { useGenerationStore, runArtifactGeneration } from '@/store/generationStore'
import { ForgeButton } from '@/components/forge/ForgeButton'
import { ARTIFACT_TYPE_ORDER } from '@/types'
import type { ProjectContext } from '@/lib/claude/types'

interface GenerateAllButtonProps {
  projectContext: ProjectContext
  projectId: string
}

/**
 * "Generate All" button — fires all 10 artifact generations simultaneously.
 *
 * Shows progress during generation ("Generating 4 / 10…").
 * Disabled while any generation is already in progress.
 * Skips artifacts that are already complete (use Regenerate on individual cards).
 */
export function GenerateAllButton({ projectContext, projectId }: GenerateAllButtonProps) {
  const artifactStates = useGenerationStore((s) => s.artifactStates)
  const store = useGenerationStore()
  const abortRefs = React.useRef<AbortController[]>([])

  const generatingCount = ARTIFACT_TYPE_ORDER.filter(
    (t) => artifactStates[t].status === 'generating',
  ).length
  const completeCount = ARTIFACT_TYPE_ORDER.filter(
    (t) => artifactStates[t].status === 'complete',
  ).length
  const pendingCount = ARTIFACT_TYPE_ORDER.filter(
    (t) => artifactStates[t].status === 'idle' || artifactStates[t].status === 'error',
  ).length

  const isAnyGenerating = generatingCount > 0
  const allDone = completeCount === ARTIFACT_TYPE_ORDER.length
  const noPending = pendingCount === 0

  function handleGenerateAll() {
    // Cancel any lingering aborts from before
    abortRefs.current.forEach((c) => c.abort())
    abortRefs.current = []

    // Only generate idle and error artifacts — don't re-run complete ones
    const toGenerate = ARTIFACT_TYPE_ORDER.filter(
      (t) => artifactStates[t].status === 'idle' || artifactStates[t].status === 'error',
    )

    for (const type of toGenerate) {
      const ctrl = new AbortController()
      abortRefs.current.push(ctrl)
      void runArtifactGeneration(type, projectContext, projectId, store, ctrl.signal)
    }
  }

  function handleCancelAll() {
    abortRefs.current.forEach((c) => c.abort())
    abortRefs.current = []
  }

  if (allDone) {
    return (
      <span className="text-forge-sm text-[var(--color-fg-muted)]">
        ✓ All {ARTIFACT_TYPE_ORDER.length} artifacts generated
      </span>
    )
  }

  if (isAnyGenerating) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-forge-sm text-[var(--color-fg-muted)]">
          Generating {generatingCount} / {ARTIFACT_TYPE_ORDER.length}…
        </span>
        <ForgeButton variant="ghost" size="sm" onClick={handleCancelAll}>
          Cancel All
        </ForgeButton>
      </div>
    )
  }

  return (
    <ForgeButton
      variant="primary"
      onClick={handleGenerateAll}
      disabled={noPending}
    >
      {completeCount > 0 ? `Generate Remaining (${pendingCount})` : 'Generate All'}
    </ForgeButton>
  )
}
