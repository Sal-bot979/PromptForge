'use client'

import * as React from 'react'
import { useStyleStore } from '@/store/styleStore'
import { StyleProfileCard, StyleBuilderForm, StylePreviewPanel } from '@/components/features/StyleEngine'
import { ForgeButton } from '@/components/forge/ForgeButton'
import type { StyleProfile } from '@/types'

/**
 * Interactive portion of the /styles page.
 *
 * Manages the "New Style" form and edit-profile state on top of the
 * StyleProfileCard grid. The store is already hydrated by StyleStoreInitializer
 * rendered in the parent server component.
 */
export function StylesPageClient() {
  const profiles = useStyleStore((s) => s.profiles)
  const activeProfileId = useStyleStore((s) => s.activeProfileId)

  const [showNewForm, setShowNewForm] = React.useState(false)
  const [editingProfile, setEditingProfile] = React.useState<StyleProfile | null>(null)
  const [showPreview, setShowPreview] = React.useState(false)

  function handleSave(_saved: StyleProfile) {
    setShowNewForm(false)
    setEditingProfile(null)
  }

  function handleCancelForm() {
    setShowNewForm(false)
    setEditingProfile(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-forge-lg font-semibold">Style Profiles</h2>
          <p className="text-forge-sm text-[var(--color-fg-muted)] mt-0.5">
            {profiles.length} profile{profiles.length !== 1 ? 's' : ''} · Active profile applies to all new generations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ForgeButton
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? 'Hide Preview' : 'Style Preview'}
          </ForgeButton>
          <ForgeButton
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingProfile(null)
              setShowNewForm(true)
            }}
            disabled={showNewForm}
          >
            New Style
          </ForgeButton>
        </div>
      </div>

      {/* Style preview panel */}
      {showPreview && (
        <StylePreviewPanel
          onSelectStyle={(styleType) => {
            const match = profiles.find((p) => p.style_type === styleType)
            if (match) {
              useStyleStore.getState().setActiveProfile(match.id)
            }
            setShowPreview(false)
          }}
        />
      )}

      {/* New / edit form */}
      {(showNewForm || editingProfile) && (
        <StyleBuilderForm
          profile={editingProfile ?? undefined}
          onSave={handleSave}
          onCancel={handleCancelForm}
        />
      )}

      {/* Profile grid */}
      {profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-forge-sm text-[var(--color-fg-muted)]">No style profiles yet.</p>
          <p className="text-forge-xs text-[var(--color-fg-subtle)] mt-1">
            Click "New Style" to create your first profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <StyleProfileCard
              key={profile.id}
              profile={profile}
              isActive={profile.id === activeProfileId}
              onEdit={(p) => {
                setShowNewForm(false)
                setEditingProfile(p)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
