import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS class names, resolving conflicts correctly.
 *
 * Uses clsx for conditional class logic and tailwind-merge to deduplicate
 * conflicting Tailwind utilities (e.g. `px-2 px-4` → `px-4`).
 *
 * @example
 * cn('px-2 py-1', isActive && 'bg-forge-accent', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Truncates a string to the given length, appending an ellipsis if truncated.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Formats a UTC timestamp string to a human-readable relative time.
 * e.g. "2 hours ago", "3 days ago", "Jan 5"
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Estimates the number of Claude tokens in a string.
 * Approximation: ~4 characters per token (faster than running a tokenizer).
 * Use for display purposes only, not for enforcing limits.
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Converts an artifact type enum value to a filename.
 * e.g. 'claude_md' → 'CLAUDE.md', 'prd' → 'PRD.md'
 */
export function artifactTypeToFilename(type: string): string {
  const map: Record<string, string> = {
    prd: 'PRD.md',
    architecture: 'ARCHITECTURE.md',
    design: 'DESIGN.md',
    phases: 'PHASES.md',
    testing: 'TESTING.md',
    claude_md: 'CLAUDE.md',
    antigravity: 'ANTIGRAVITY_PROMPT.md',
    claude_code: 'CLAUDE_CODE_PROMPT.md',
    deployment: 'DEPLOYMENT.md',
    changelog: 'CHANGELOG_TEMPLATE.md',
  }
  return map[type] ?? `${type.toUpperCase()}.md`
}

/**
 * Checks if a string contains any of the given keywords (case-insensitive).
 * Used by snippet auto-injection to match trigger_keywords against project descriptions.
 */
export function containsKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some((kw) => lower.includes(kw.toLowerCase()))
}

/**
 * Returns the current ISO month string e.g. "2026-03".
 * Used for resetting monthly generation counts.
 */
export function currentMonthString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
