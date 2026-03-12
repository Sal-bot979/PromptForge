import * as React from 'react'
import { cn } from '@/lib/utils'

interface ForgeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** When true, applies hover border highlight — use for clickable/interactive cards */
  interactive?: boolean
  /** Removes padding for cards that need full-bleed content */
  noPadding?: boolean
}

/**
 * PromptForge dark surface card.
 *
 * The primary container for all content panels, project items, and artifact displays.
 * Uses the `--color-surface` background with a subtle border.
 *
 * @example
 * // Static content card
 * <ForgeCard>
 *   <h3>Project Name</h3>
 * </ForgeCard>
 *
 * // Interactive (clickable) card
 * <ForgeCard interactive onClick={handleClick}>
 *   <ProjectPreview />
 * </ForgeCard>
 */
export function ForgeCard({ interactive = false, noPadding = false, className, children, ...props }: ForgeCardProps) {
  return (
    <div
      className={cn(
        'rounded-forge-lg border border-[var(--color-border)]',
        'bg-[var(--color-surface)]',
        !noPadding && 'p-4',
        interactive && [
          'cursor-pointer transition-all duration-[var(--transition)]',
          'hover:border-[var(--color-surface-3)] hover:bg-[var(--color-surface-2)]',
          'hover:shadow-forge',
        ],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Composable sub-components for structured card layouts

interface ForgeCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ForgeCardHeader({ className, children, ...props }: ForgeCardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3 mb-3', className)} {...props}>
      {children}
    </div>
  )
}

interface ForgeCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function ForgeCardTitle({ className, children, ...props }: ForgeCardTitleProps) {
  return (
    <h3 className={cn('text-forge-base font-semibold text-[var(--color-fg)] leading-tight', className)} {...props}>
      {children}
    </h3>
  )
}

interface ForgeCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function ForgeCardDescription({ className, children, ...props }: ForgeCardDescriptionProps) {
  return (
    <p className={cn('text-forge-sm text-[var(--color-fg-muted)] leading-relaxed', className)} {...props}>
      {children}
    </p>
  )
}

interface ForgeCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ForgeCardFooter({ className, children, ...props }: ForgeCardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 mt-4',
        'pt-4 border-t border-[var(--color-border)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
