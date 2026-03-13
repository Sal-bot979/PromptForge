'use client'

import * as React from 'react'
import { useGenerationStore, runArtifactGeneration } from '@/store/generationStore'
import { ForgeCard, ForgeCardHeader, ForgeCardTitle, ForgeCardFooter } from '@/components/forge/ForgeCard'
import { ForgeButton } from '@/components/forge/ForgeButton'
import { StatusChip } from '@/components/forge/StatusChip'
import { StreamingText } from './StreamingText'
import { MarkdownPreview } from './MarkdownPreview'
import type { ArtifactType } from '@/types'
import { ARTIFACT_TYPE_LABELS } from '@/types'
import type { ProjectContext } from '@/lib/claude/types'
import { artifactTypeToFilename } from '@/lib/utils'

interface ArtifactCardProps {
  type: ArtifactType
  projectContext: ProjectContext
  projectId: string
}

type ViewMode = 'raw' | 'preview'

/**
 * Single artifact card for the generation grid.
 *
 * States:
 * - idle: empty card with "Generate" button
 * - generating: streaming text + animated cursor + "Cancel" button
 * - complete: content with Copy (primary) + Regenerate + Raw/Preview toggle
 * - error: error message + "Retry" button
 */
export function ArtifactCard({ type, projectContext, projectId }: ArtifactCardProps) {
  const artifactState = useGenerationStore((s) => s.artifactStates[type])
  const store = useGenerationStore()
  const abortRef = React.useRef<AbortController | null>(null)
  const [viewMode, setViewMode] = React.useState<ViewMode>('raw')
  const [copied, setCopied] = React.useState(false)

  const { status, streamingContent, error } = artifactState
  const label = ARTIFACT_TYPE_LABELS[type]
  const filename = artifactTypeToFilename(type)

  function handleGenerate() {
    abortRef.current = new AbortController()
    void runArtifactGeneration(type, projectContext, projectId, store, abortRef.current.signal)
  }

  function handleCancel() {
    abortRef.current?.abort()
  }

  async function handleCopy() {
    if (!streamingContent) return
    try {
      await navigator.clipboard.writeText(streamingContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — fall back to selection
      const el = document.createElement('textarea')
      el.value = streamingContent
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleRegenerate() {
    store.resetArtifact(type)
    abortRef.current = new AbortController()
    void runArtifactGeneration(type, projectContext, projectId, store, abortRef.current.signal)
  }

  return (
    <ForgeCard noPadding className="flex flex-col overflow-hidden">
      {/* Header */}
      <ForgeCardHeader className="px-4 pt-4 pb-3 mb-0">
        <div className="flex items-center gap-2 min-w-0">
          <ForgeCardTitle className="text-forge-sm truncate">{label}</ForgeCardTitle>
          <span className="text-forge-xs text-[var(--color-fg-subtle)] font-mono flex-shrink-0">
            {filename}
          </span>
        </div>
        <StatusChip status={status} showDot={status === 'generating'}>
          {statusLabel(status)}
        </StatusChip>
      </ForgeCardHeader>

      {/* Content area */}
      <div className="flex-1 min-h-[180px] max-h-[360px] overflow-y-auto px-4 py-0">
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <p className="text-forge-xs text-[var(--color-fg-subtle)] mb-3">
              Click Generate to create this artifact
            </p>
          </div>
        )}

        {(status === 'generating' || status === 'complete') && (
          viewMode === 'preview' && status === 'complete' ? (
            <MarkdownPreview content={streamingContent} className="pb-4 pt-1" />
          ) : (
            <StreamingText
              content={streamingContent}
              isStreaming={status === 'generating'}
              className="pb-4 pt-1"
            />
          )
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center px-4">
            <p className="text-forge-xs text-[var(--color-error)] mb-1 font-medium">Generation failed</p>
            <p className="text-forge-xs text-[var(--color-fg-subtle)]">{error}</p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <ForgeCardFooter className="px-4 pb-3 pt-3">
        {status === 'idle' && (
          <ForgeButton variant="secondary" size="sm" onClick={handleGenerate}>
            Generate
          </ForgeButton>
        )}

        {status === 'generating' && (
          <>
            <span className="text-forge-xs text-[var(--color-fg-subtle)]">
              {streamingContent.length.toLocaleString()} chars…
            </span>
            <ForgeButton variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </ForgeButton>
          </>
        )}

        {status === 'complete' && (
          <>
            {/* View mode toggle */}
            <div className="flex gap-1 p-0.5 rounded bg-[var(--color-surface-2)] border border-[var(--color-border)]">
              {(['raw', 'preview'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={
                    viewMode === m
                      ? 'px-2 py-0.5 rounded text-forge-xs font-medium bg-[var(--color-surface)] text-[var(--color-fg)]'
                      : 'px-2 py-0.5 rounded text-forge-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]'
                  }
                  aria-pressed={viewMode === m}
                >
                  {m === 'raw' ? 'Raw' : 'Preview'}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <ForgeButton variant="ghost" size="sm" onClick={handleRegenerate}>
                Regenerate
              </ForgeButton>
              <ForgeButton variant="primary" size="sm" onClick={handleCopy}>
                {copied ? '✓ Copied' : 'Copy'}
              </ForgeButton>
            </div>
          </>
        )}

        {status === 'error' && (
          <ForgeButton variant="secondary" size="sm" onClick={handleGenerate}>
            Retry
          </ForgeButton>
        )}
      </ForgeCardFooter>
    </ForgeCard>
  )
}

function statusLabel(status: string): string {
  switch (status) {
    case 'idle': return 'Ready'
    case 'generating': return 'Generating'
    case 'complete': return 'Complete'
    case 'error': return 'Error'
    default: return status
  }
}
