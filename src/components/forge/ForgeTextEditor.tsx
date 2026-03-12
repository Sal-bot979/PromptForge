'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { estimateTokenCount } from '@/lib/utils'

interface ForgeTextEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  /** Show character + token count in the bottom-right corner */
  showCounts?: boolean
  /** Auto-grow height up to maxRows */
  autoGrow?: boolean
  maxRows?: number
}

/**
 * PromptForge styled multi-line text editor.
 *
 * Used for project descriptions, snippet content, and free-form input fields.
 * For the full Prompt Lab editor with syntax highlighting, see the PromptLabEditor component.
 *
 * @example
 * <ForgeTextEditor
 *   label="Project Description"
 *   placeholder="Describe your project..."
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 *   showCounts
 *   rows={6}
 * />
 */
export const ForgeTextEditor = React.forwardRef<HTMLTextAreaElement, ForgeTextEditorProps>(
  function ForgeTextEditor(
    { label, error, hint, showCounts = false, autoGrow = false, maxRows = 20, className, id, onChange, ...props },
    ref,
  ) {
    const inputId = id ?? React.useId()
    const errorId = error ? `${inputId}-error` : undefined
    const hintId = hint ? `${inputId}-hint` : undefined
    const internalRef = React.useRef<HTMLTextAreaElement>(null)

    // Combine external ref with internal ref for auto-grow
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) ?? internalRef

    const [charCount, setCharCount] = React.useState(
      typeof props.value === 'string' ? props.value.length : 0,
    )

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
      setCharCount(e.target.value.length)

      if (autoGrow && textareaRef.current) {
        // Reset height to auto to get correct scrollHeight
        textareaRef.current.style.height = 'auto'
        const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight)
        const maxHeight = lineHeight * maxRows
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
      }

      onChange?.(e)
    }

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-forge-sm font-medium text-[var(--color-fg-muted)]">
            {label}
          </label>
        )}

        <div className="relative">
          <textarea
            ref={textareaRef}
            id={inputId}
            aria-describedby={cn(errorId, hintId)}
            aria-invalid={error ? 'true' : undefined}
            onChange={handleChange}
            className={cn(
              'w-full rounded-forge text-forge-sm font-mono',
              'bg-[var(--color-surface-3)] text-[var(--color-fg)]',
              'border border-[var(--color-border)]',
              'placeholder:text-[var(--color-fg-subtle)] placeholder:font-sans',
              'px-3 py-2.5 resize-y',
              'transition-colors duration-[var(--transition-fast)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
              'focus:border-[var(--color-accent)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-[var(--color-error)] focus:ring-[var(--color-error)]',
              showCounts && 'pb-8',
              autoGrow && 'overflow-hidden resize-none',
              className,
            )}
            {...props}
          />

          {showCounts && (
            <div className="absolute bottom-2 right-3 flex items-center gap-3 pointer-events-none">
              <span className="text-forge-xs text-[var(--color-fg-subtle)]">
                {charCount.toLocaleString()} chars
              </span>
              <span className="text-forge-xs text-[var(--color-fg-subtle)]">
                ~{estimateTokenCount(typeof props.value === 'string' ? props.value : '').toLocaleString()} tokens
              </span>
            </div>
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
