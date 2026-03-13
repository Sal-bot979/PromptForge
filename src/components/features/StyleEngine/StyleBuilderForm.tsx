'use client'

import * as React from 'react'
import { useStyleStore } from '@/store/styleStore'
import { createStyleProfileAction, updateStyleProfileAction } from '@/app/(app)/styles/actions'
import { ForgeButton } from '@/components/forge/ForgeButton'
import { ForgeTextField } from '@/components/forge/ForgeTextField'
import { ForgeCard } from '@/components/forge/ForgeCard'
import { cn } from '@/lib/utils'
import type { StyleProfile, StyleType } from '@/types'

const STYLE_TYPES: { value: StyleType; label: string; description: string }[] = [
  { value: 'structured', label: 'Structured', description: 'Lists, tables, checkboxes' },
  { value: 'narrative', label: 'Narrative', description: 'Prose-driven reasoning' },
  { value: 'terse', label: 'Terse', description: 'Dense, minimal, imperative' },
  { value: 'custom', label: 'Custom', description: 'Rules only, no base style' },
]

interface StyleBuilderFormProps {
  /** If provided, editing an existing profile; otherwise creating a new one */
  profile?: StyleProfile
  onSave: (profile: StyleProfile) => void
  onCancel: () => void
}

/**
 * Form for creating or editing a custom style profile.
 *
 * Allows setting a name, choosing a base style_type, and managing a
 * dynamic list of style rules (plain English directives like
 * "Always start with a TL;DR").
 */
export function StyleBuilderForm({ profile, onSave, onCancel }: StyleBuilderFormProps) {
  const [name, setName] = React.useState(profile?.name ?? '')
  const [styleType, setStyleType] = React.useState<StyleType>(profile?.style_type ?? 'structured')
  const [rules, setRules] = React.useState<string[]>(
    profile?.rules?.length ? profile.rules : [''],
  )
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const addProfile = useStyleStore((s) => s.addProfile)
  const updateProfile = useStyleStore((s) => s.updateProfile)

  const isEditing = Boolean(profile)

  function addRule() {
    setRules((prev) => [...prev, ''])
  }

  function updateRule(index: number, value: string) {
    setRules((prev) => prev.map((r, i) => (i === index ? value : r)))
  }

  function removeRule(index: number) {
    setRules((prev) => prev.filter((_, i) => i !== index))
  }

  function moveRule(index: number, direction: -1 | 1) {
    const next = [...rules]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target]!, next[index]!]
    setRules(next)
  }

  async function handleSave() {
    setError(null)
    if (!name.trim()) { setError('Profile name is required.'); return }

    setIsSaving(true)
    try {
      const cleanedRules = rules.filter((r) => r.trim().length > 0)

      if (isEditing && profile) {
        const result = await updateStyleProfileAction(profile.id, { name, rules: cleanedRules })
        if ('error' in result) { setError(result.error); return }
        updateProfile(result.data)
        onSave(result.data)
      } else {
        const result = await createStyleProfileAction({ name, style_type: styleType, rules: cleanedRules })
        if ('error' in result) { setError(result.error); return }
        addProfile(result.data)
        onSave(result.data)
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ForgeCard className="flex flex-col gap-5">
      <div>
        <h2 className="text-forge-lg font-semibold mb-1">
          {isEditing ? `Edit "${profile!.name}"` : 'New Style Profile'}
        </h2>
        <p className="text-forge-sm text-[var(--color-fg-muted)]">
          Rules are plain-English directives applied to every generation using this profile.
        </p>
      </div>

      {/* Name */}
      <ForgeTextField
        label="Profile Name"
        placeholder="My Technical Style"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoFocus
      />

      {/* Base style type */}
      {!isEditing && (
        <div className="flex flex-col gap-1.5">
          <label className="text-forge-sm font-medium text-[var(--color-fg-muted)]">
            Base Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STYLE_TYPES.map(({ value, label, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => setStyleType(value)}
                className={cn(
                  'flex flex-col items-start px-3 py-2 rounded-forge border text-left transition-all',
                  styleType === value
                    ? 'border-[var(--color-accent)]/60 bg-[var(--color-accent-muted)] text-[var(--color-fg)]'
                    : 'border-[var(--color-border)] text-[var(--color-fg-muted)] hover:border-[var(--color-surface-3)] hover:bg-[var(--color-surface-2)]',
                )}
              >
                <span className="text-forge-sm font-medium">{label}</span>
                <span className="text-forge-xs opacity-70">{description}</span>
              </button>
            ))}
          </div>
          <p className="text-forge-xs text-[var(--color-fg-subtle)]">
            Your rules are applied on top of the base style's defaults.
          </p>
        </div>
      )}

      {/* Rules */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-forge-sm font-medium text-[var(--color-fg-muted)]">
            Style Rules
          </label>
          <span className="text-forge-xs text-[var(--color-fg-subtle)]">{rules.filter(Boolean).length} rules</span>
        </div>

        <div className="space-y-2">
          {rules.map((rule, i) => (
            <div key={i} className="flex items-center gap-2">
              {/* Reorder */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveRule(i, -1)}
                  disabled={i === 0}
                  className="text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] disabled:opacity-30 p-0.5"
                  aria-label="Move rule up"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveRule(i, 1)}
                  disabled={i === rules.length - 1}
                  className="text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] disabled:opacity-30 p-0.5"
                  aria-label="Move rule down"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              <input
                type="text"
                value={rule}
                onChange={(e) => updateRule(i, e.target.value)}
                placeholder={`Rule ${i + 1} — e.g. "Always start with a TL;DR"`}
                className={cn(
                  'flex-1 h-9 px-3 rounded-forge text-forge-sm',
                  'bg-[var(--color-surface-3)] text-[var(--color-fg)]',
                  'border border-[var(--color-border)]',
                  'placeholder:text-[var(--color-fg-subtle)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]',
                )}
              />

              <button
                type="button"
                onClick={() => removeRule(i)}
                className="text-[var(--color-fg-subtle)] hover:text-[var(--color-error)] transition-colors p-1"
                aria-label={`Remove rule ${i + 1}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRule}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-forge text-forge-sm',
            'border border-dashed border-[var(--color-border)]',
            'text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)]',
            'hover:border-[var(--color-surface-3)] transition-colors',
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add rule
        </button>
      </div>

      {error && <p className="text-forge-sm text-[var(--color-error)]" role="alert">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3">
        <ForgeButton variant="primary" onClick={handleSave} isLoading={isSaving}>
          {isEditing ? 'Save Changes' : 'Create Profile'}
        </ForgeButton>
        <ForgeButton variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancel
        </ForgeButton>
      </div>
    </ForgeCard>
  )
}
