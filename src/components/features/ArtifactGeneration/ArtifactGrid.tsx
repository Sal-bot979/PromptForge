'use client'

import * as React from 'react'
import { useGenerationStore } from '@/store/generationStore'
import { ArtifactCard } from './ArtifactCard'
import { GenerateAllButton } from './GenerateAllButton'
import { MarkdownStyles } from './MarkdownPreview'
import { StyleStoreInitializer, StyleSelector } from '@/components/features/StyleEngine'
import { ARTIFACT_TYPE_ORDER } from '@/types'
import type { ArtifactType, StyleProfile } from '@/types'
import type { ProjectContext } from '@/lib/claude/types'

interface ArtifactGridProps {
  projectContext: ProjectContext
  projectId: string
  /** Artifacts already saved in Supabase — hydrates the store on mount */
  savedArtifacts: Array<{ type: ArtifactType; content: string }>
  /** Style profiles for this user — passed to StyleStoreInitializer */
  profiles: StyleProfile[]
  /** The user's currently active style profile ID */
  activeProfileId: string | null
}

/**
 * Grid of all 10 artifact cards for a project.
 *
 * Initializes the generation store from saved artifacts on mount,
 * so revisiting a project shows previously generated content immediately.
 */
export function ArtifactGrid({
  projectContext,
  projectId,
  savedArtifacts,
  profiles,
  activeProfileId,
}: ArtifactGridProps) {
  const initFromSaved = useGenerationStore((s) => s.initFromSaved)
  const storeProjectId = useGenerationStore((s) => s.projectId)

  // Hydrate store when entering a project page (or switching projects)
  React.useEffect(() => {
    if (storeProjectId !== projectId) {
      initFromSaved(projectId, savedArtifacts)
    }
  }, [projectId, savedArtifacts, initFromSaved, storeProjectId])

  return (
    <>
      {/* Inject markdown preview styles once */}
      <MarkdownStyles />

      {/* Hydrate style store from server-loaded props */}
      <StyleStoreInitializer profiles={profiles} activeProfileId={activeProfileId} />

      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-forge-lg font-semibold">Artifacts</h2>
          <p className="text-forge-sm text-[var(--color-fg-muted)] mt-0.5">
            {ARTIFACT_TYPE_ORDER.length} document types · Generate individually or all at once
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StyleSelector />
          <GenerateAllButton projectContext={projectContext} projectId={projectId} />
        </div>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {ARTIFACT_TYPE_ORDER.map((type) => (
          <ArtifactCard
            key={type}
            type={type}
            projectContext={projectContext}
            projectId={projectId}
          />
        ))}
      </div>
    </>
  )
}
