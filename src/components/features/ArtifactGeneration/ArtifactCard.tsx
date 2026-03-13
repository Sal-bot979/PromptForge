'use client'

import * as React from 'react'
import { useGenerationStore, runArtifactGeneration } from '@/store/generationStore'
import { useStyleStore } from '@/store/styleStore'
import { ForgeCard, ForgeCardHeader, ForgeCardTitle, ForgeCardFooter } from '@/components/forge/ForgeCard'
import { ForgeButton } from '@/components/forge/ForgeButton'
import { StatusChip } from '@/components/forge/StatusChip'
import { StreamingText } from './StreamingText'
import { MarkdownPreview } from './MarkdownPreview'
import type { ArtifactType } from '@/types'
import { ARTIFACT_TYPE_LABELS } from '@/types'
import type { ProjectContext } from '@/lib/claude/types'
import { artifactTypeToFilename, cn } from '@/lib/utils'

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
  const [styleMenuOpen, setStyleMenuOpen] = React.useState(false)
  const styleMenuRef = React.useRef<HTMLDivElement>(null)

  const profiles = useStyleStore((s) => s.profiles)
  const activeProfileId = useStyleStore((s) => s.activeProfileId)
  const artifactOverrides = useStyleStore((s) => s.artifactOverrides)
  const setArtifactOverride = useStyleStore((s) => s.setArtifactOverride)
  const clearArtifactOverride = useStyleStore((s) => s.clearArtifactOverride)

  const overrideProfileId = artifactOverrides[type]
  const effectiveProfileId = overrideProfileId ?? activeProfileId
  const effectiveProfile = profiles.find((p) => p.id === effectiveProfileId) ?? profiles.find((p) => p.style_type === 'structured')

  const { status, streamingContent, error } = artifactState
  const label = ARTIFACT_TYPE_LABELS[type]
  const filename = artifactTypeToFilename(type)

  // Close style menu on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (styleMenuRef.current && !styleMenuRef.current.contains(e.target as Node)) {
        setStyleMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

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
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Per-artifact style override badge */}
          {profiles.length > 0 && (
            <div className="relative" ref={styleMenuRef}>
              <button
                onClick={() => setStyleMenuOpen((v) => !v)}
                className={cn(
                  'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors',
                  overrideProfileId
                    ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] border-[var(--color-accent)]/30'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-fg-subtle)] border-[var(--color-border)] hover:text-[var(--color-fg-muted)]',
                )}
                title={overrideProfileId ? 'Style override active — click to change' : 'Override style for this artifact'}
                aria-haspopup="listbox"
                aria-expanded={styleMenuOpen}
              >
                {effectiveProfile?.style_type ?? 'style'}
                {overrideProfileId && <span aria-label="override active">*</span>}
              </button>

              {styleMenuOpen && (
                <div
                  className={cn(
                    'absolute right-0 top-full mt-1 z-50 min-w-[180px]',
                    'rounded-forge border border-[var(--color-border)]',
                    'bg-[var(--color-surface)] shadow-forge-lg py-1',
                  )}
                  role="listbox"
                >
                  <p className="px-3 py-1 text-[10px] text-[var(--color-fg-subtle)] uppercase tracking-wide">
                    Override style
                  </p>
                  {profiles.map((profile) => (
                    <button
                      key={profile.id}
                      role="option"
                      aria-selected={profile.id === effectiveProfileId}
                      onClick={() => {
                        setArtifactOverride(type, profile.id)
                        setStyleMenuOpen(false)
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-1.5 text-forge-xs text-left transition-colors',
                        profile.id === effectiveProfileId
                          ? 'text-[var(--color-accent)] bg-[var(--color-accent-muted)]'
                          : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]',
                      )}
                    >
                      <span>{profile.name}</span>
                      <span className="text-[10px] opacity-60">{profile.style_type}</span>
                    </button>
                  ))}
                  {overrideProfileId && (
                    <div className="border-t border-[var(--color-border)] mt-1 pt-1">
                      <button
                        onClick={() => {
                          clearArtifactOverride(type)
                          setStyleMenuOpen(false)
                        }}
                        className="w-full px-3 py-1.5 text-forge-xs text-left text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] transition-colors"
                      >
                        Use project default
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <StatusChip status={status} showDot={status === 'generating'}>
            {statusLabel(status)}
          </StatusChip>
        </div>
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
