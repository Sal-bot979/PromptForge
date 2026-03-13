'use client'

import * as React from 'react'
import { useStyleStore, isBuiltInProfile } from '@/store/styleStore'
import { deleteStyleProfileAction, setActiveStyleProfileAction } from '@/app/(app)/styles/actions'
import { ForgeCard, ForgeCardHeader, ForgeCardTitle, ForgeCardDescription } from '@/components/forge/ForgeCard'
import { ForgeButton } from '@/components/forge/ForgeButton'
import { StatusChip } from '@/components/forge/StatusChip'
import { cn } from '@/lib/utils'
import type { StyleProfile, StyleType } from '@/types'

const STYLE_TYPE_VARIANT: Record<StyleType, 'info' | 'accent' | 'warning' | 'default'> = {
  structured: 'info',
  narrative: 'accent',
  terse: 'warning',
  custom: 'default',
}

interface StyleProfileCardProps {
  profile: StyleProfile
  isActive: boolean
  onEdit: (profile: StyleProfile) => void
}

/**
 * Card representing a single style profile in the /styles page grid.
 *
 * Shows name, style_type badge, rule count, and Built-in indicator.
 * Allows setting as active, editing (custom only), and deleting (custom only).
 */
export function StyleProfileCard({ profile, isActive, onEdit }: StyleProfileCardProps) {
  const setActiveProfile = useStyleStore((s) => s.setActiveProfile)
  const removeProfile = useStyleStore((s) => s.removeProfile)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isSetting, setIsSetting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isBuiltIn = isBuiltInProfile(profile)

  async function handleSetActive() {
    if (isActive) return
    setIsSetting(true)
    setActiveProfile(profile.id)
    const result = await setActiveStyleProfileAction(profile.id)
    if ('error' in result) setError(result.error)
    setIsSetting(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${profile.name}"? This cannot be undone.`)) return
    setIsDeleting(true)
    const result = await deleteStyleProfileAction(profile.id)
    if ('error' in result) {
      setError(result.error)
      setIsDeleting(false)
    } else {
      removeProfile(profile.id)
    }
  }

  return (
    <ForgeCard
      className={cn(
        'flex flex-col gap-3 transition-all',
        isActive && 'border-[var(--color-accent)]/40 bg-[var(--color-accent-muted)]/10',
      )}
    >
      <ForgeCardHeader className="mb-0">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <ForgeCardTitle className="truncate">{profile.name}</ForgeCardTitle>
          <StatusChip variant={STYLE_TYPE_VARIANT[profile.style_type]}>
            {profile.style_type}
          </StatusChip>
          {isBuiltIn && (
            <StatusChip variant="default">Built-in</StatusChip>
          )}
        </div>
        {isActive && (
          <span className="flex-shrink-0">
            <StatusChip variant="accent" showDot>Active</StatusChip>
          </span>
        )}
      </ForgeCardHeader>

      {/* Rules preview */}
      {profile.rules.length > 0 ? (
        <ul className="space-y-1">
          {profile.rules.slice(0, 3).map((rule, i) => (
            <li key={i} className="flex items-start gap-1.5 text-forge-xs text-[var(--color-fg-muted)]">
              <span className="mt-1 w-1 h-1 rounded-full bg-[var(--color-fg-subtle)] flex-shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">{rule}</span>
            </li>
          ))}
          {profile.rules.length > 3 && (
            <li className="text-forge-xs text-[var(--color-fg-subtle)] pl-2.5">
              +{profile.rules.length - 3} more rules
            </li>
          )}
        </ul>
      ) : (
        <ForgeCardDescription>No custom rules — uses base style defaults.</ForgeCardDescription>
      )}

      {error && <p className="text-forge-xs text-[var(--color-error)]">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {!isActive && (
          <ForgeButton
            variant="secondary"
            size="sm"
            onClick={handleSetActive}
            isLoading={isSetting}
          >
            Set Active
          </ForgeButton>
        )}
        {!isBuiltIn && (
          <>
            <ForgeButton variant="ghost" size="sm" onClick={() => onEdit(profile)}>
              Edit
            </ForgeButton>
            <ForgeButton
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </ForgeButton>
          </>
        )}
      </div>
    </ForgeCard>
  )
}
