'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ForgeTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftAdornment?: React.ReactNode
  rightAdornment?: React.ReactNode
}

/**
 * PromptForge styled single-line text input.
 *
 * @example
 * <ForgeTextField
 *   label="Project Name"
 *   placeholder="My AI App"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   error={errors.name}
 * />
 */
export const ForgeTextField = React.forwardRef<HTMLInputElement, ForgeTextFieldProps>(
  function ForgeTextField({ label, error, hint, leftAdornment, rightAdornment, className, id, ...props }, ref) {
    const inputId = id ?? React.useId()
    const errorId = error ? `${inputId}-error` : undefined
    const hintId = hint ? `${inputId}-hint` : undefined

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-forge-sm font-medium text-[var(--color-fg-muted)]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAdornment && (
            <span className="absolute left-3 text-[var(--color-fg-subtle)] flex items-center">
              {leftAdornment}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-describedby={cn(errorId, hintId)}
            aria-invalid={error ? 'true' : undefined}
            className={cn(
              'w-full h-9 rounded-forge text-forge-sm',
              'bg-[var(--color-surface-3)] text-[var(--color-fg)]',
              'border border-[var(--color-border)]',
              'placeholder:text-[var(--color-fg-subtle)]',
              'px-3 py-2',
              'transition-colors duration-[var(--transition-fast)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
              'focus:border-[var(--color-accent)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-[var(--color-error)] focus:ring-[var(--color-error)]',
              leftAdornment && 'pl-9',
              rightAdornment && 'pr-9',
              className,
            )}
            {...props}
          />

          {rightAdornment && (
            <span className="absolute right-3 text-[var(--color-fg-subtle)] flex items-center">
              {rightAdornment}
            </span>
          )}
        </div>

        {hint && !error && (
          <p id={hintId} className="text-forge-xs text-[var(--color-fg-subtle)]">
            {hint}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-forge-xs text-[var(--color-error)]" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)
