'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ForgeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

/**
 * PromptForge primary button component.
 *
 * - `primary`: Accent yellow-green background — use for the single most important action per view.
 * - `secondary`: Dark surface with border — use for secondary actions.
 * - `ghost`: No background, text only — use for tertiary actions and nav items.
 * - `danger`: Red tinted — use for destructive actions (delete, revoke).
 *
 * @example
 * <ForgeButton variant="primary" onClick={handleGenerate}>
 *   Generate All
 * </ForgeButton>
 */
export function ForgeButton({
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  children,
  ...props
}: ForgeButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <button
      disabled={isDisabled}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2 font-medium',
        'rounded-forge transition-all duration-[var(--transition-fast)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
        'focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variants
        variant === 'primary' && [
          'bg-[var(--color-accent)] text-[#0a0a0b]',
          'hover:bg-[var(--color-accent-hover)]',
          'active:scale-[0.98]',
          'shadow-[var(--shadow-forge-accent)]',
        ],
        variant === 'secondary' && [
          'bg-[var(--color-surface)] text-[var(--color-fg)]',
          'border border-[var(--color-border)]',
          'hover:bg-[var(--color-surface-2)] hover:border-[var(--color-surface-3)]',
          'active:scale-[0.98]',
        ],
        variant === 'ghost' && [
          'bg-transparent text-[var(--color-fg-muted)]',
          'hover:bg-[var(--color-surface-2)] hover:text-[var(--color-fg)]',
          'active:scale-[0.98]',
        ],
        variant === 'danger' && [
          'bg-[var(--color-surface)] text-[var(--color-error)]',
          'border border-[var(--color-border)]',
          'hover:bg-red-950/50 hover:border-red-900',
          'active:scale-[0.98]',
        ],
        // Sizes
        size === 'sm' && 'h-8 px-3 text-sm',
        size === 'md' && 'h-9 px-4 text-sm',
        size === 'lg' && 'h-11 px-6 text-base',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        leftIcon && <span aria-hidden="true">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
    </button>
  )
}
