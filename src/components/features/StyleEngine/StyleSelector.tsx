'use client'

import * as React from 'react'
import Link from 'next/link'
import { useStyleStore } from '@/store/styleStore'
import { setActiveStyleProfileAction } from '@/app/(app)/styles/actions'
import { StatusChip } from '@/components/forge/StatusChip'
import { cn } from '@/lib/utils'
import type { StyleType } from '@/types'

const STYLE_TYPE_COLORS: Record<StyleType, string> = {
  structured: 'bg-blue-950/50 text-blue-400 border-blue-900/50',
  narrative: 'bg-purple-950/50 text-purple-400 border-purple-900/50',
  terse: 'bg-orange-950/50 text-orange-400 border-orange-900/50',
  custom: 'bg-[var(--color-surface-2)] text-[var(--color-fg-muted)] border-[var(--color-border)]',
}

/**
 * Compact dropdown for selecting the active style profile.
 *
 * Placed in the project detail page header so users can switch styles
 * before (or between) artifact generations.
 * Persists selection to Supabase via setActiveStyleProfileAction.
 */
export function StyleSelector() {
  const profiles = useStyleStore((s) => s.profiles)
  const activeProfileId = useStyleStore((s) => s.activeProfileId)
  const setActiveProfile = useStyleStore((s) => s.setActiveProfile)
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? profiles[0]

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSelect(profileId: string) {
    setIsOpen(false)
    setActiveProfile(profileId)
    setIsSaving(true)
    await setActiveStyleProfileAction(profileId)
    setIsSaving(false)
  }

  if (profiles.length === 0) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-forge text-forge-sm',
          'border border-[var(--color-border)] bg-[var(--color-surface)]',
          'hover:border-[var(--color-surface-3)] hover:bg-[var(--color-surface-2)]',
          'transition-colors',
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-[var(--color-fg-muted)]">Style:</span>
        <span className="font-medium text-[var(--color-fg)]">
          {isSaving ? '…' : (activeProfile?.name ?? 'Select')}
        </span>
        {activeProfile && (
          <span
            className={cn(
              'px-1.5 py-0.5 rounded-full text-[10px] font-medium border',
              STYLE_TYPE_COLORS[activeProfile.style_type],
            )}
          >
            {activeProfile.style_type}
          </span>
        )}
        <svg
          className={cn('w-3.5 h-3.5 text-[var(--color-fg-subtle)] transition-transform', isOpen && 'rotate-180')}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 top-full mt-1 z-50 min-w-[220px]',
            'rounded-forge-md border border-[var(--color-border)]',
            'bg-[var(--color-surface)] shadow-forge-lg',
            'py-1',
          )}
          role="listbox"
          aria-label="Select style profile"
        >
          {profiles.map((profile) => (
            <button
              key={profile.id}
              role="option"
              aria-selected={profile.id === activeProfileId}
              onClick={() => handleSelect(profile.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2',
                'text-forge-sm text-left transition-colors',
                profile.id === activeProfileId
                  ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                  : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]',
              )}
            >
              <div className="flex items-center gap-2">
                {profile.id === activeProfileId && (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {profile.id !== activeProfileId && <span className="w-3.5" />}
                <span>{profile.name}</span>
              </div>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0',
                  STYLE_TYPE_COLORS[profile.style_type],
                )}
              >
                {profile.style_type}
              </span>
            </button>
          ))}

          <div className="border-t border-[var(--color-border)] mt-1 pt-1">
            <Link
              href="/styles"
              className="block px-3 py-2 text-forge-xs text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] hover:bg-[var(--color-surface-2)] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Manage styles →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
