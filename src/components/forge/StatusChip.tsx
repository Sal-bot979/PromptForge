import * as React from 'react'
import { cn } from '@/lib/utils'
import type { GenerationStatus } from '@/types'

type ChipVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent'

interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant
  /** Maps GenerationStatus to the appropriate variant automatically */
  status?: GenerationStatus
  /** Show a pulsing dot indicator (useful for 'generating' states) */
  showDot?: boolean
}

/**
 * Color-coded status label chip.
 *
 * Used to display generation status, artifact state, and categorization labels
 * throughout the PromptForge UI.
 *
 * Pass either `variant` directly or `status` (which maps to a variant automatically).
 *
 * @example
 * // Explicit variant
 * <StatusChip variant="success">Complete</StatusChip>
 *
 * // From generation status
 * <StatusChip status="generating" showDot>Generating...</StatusChip>
 *
 * // Tag-style usage
 * <StatusChip variant="default">Next.js</StatusChip>
 */
export function StatusChip({ variant, status, showDot = false, className, children, ...props }: StatusChipProps) {
  // Map GenerationStatus to variant
  const resolvedVariant: ChipVariant = variant ?? statusToVariant(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5',
        'rounded-full text-forge-xs font-medium',
        'border whitespace-nowrap',
        variantStyles[resolvedVariant],
        className,
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full flex-shrink-0',
            status === 'generating' && 'animate-pulse',
            dotStyles[resolvedVariant],
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

function statusToVariant(status: GenerationStatus | undefined): ChipVariant {
  switch (status) {
    case 'generating': return 'info'
    case 'complete': return 'success'
    case 'error': return 'error'
    case 'idle':
    default:
      return 'default'
  }
}

const variantStyles: Record<ChipVariant, string> = {
  default: 'bg-[var(--color-surface-2)] text-[var(--color-fg-muted)] border-[var(--color-border)]',
  success: 'bg-green-950/50 text-green-400 border-green-900/50',
  warning: 'bg-orange-950/50 text-orange-400 border-orange-900/50',
  error: 'bg-red-950/50 text-red-400 border-red-900/50',
  info: 'bg-blue-950/50 text-blue-400 border-blue-900/50',
  accent: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)] border-[var(--color-accent)]/20',
}

const dotStyles: Record<ChipVariant, string> = {
  default: 'bg-[var(--color-fg-subtle)]',
  success: 'bg-green-400',
  warning: 'bg-orange-400',
  error: 'bg-red-400',
  info: 'bg-blue-400',
  accent: 'bg-[var(--color-accent)]',
}
