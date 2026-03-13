import * as React from 'react'
import { cn } from '@/lib/utils'

interface StreamingTextProps {
  content: string
  isStreaming: boolean
  className?: string
}

/**
 * Displays artifact content during and after streaming.
 *
 * While streaming, shows a blinking block cursor at the end.
 * Uses monospace font to faithfully represent the raw markdown.
 * Content is scrollable — the card container constrains the height.
 */
export function StreamingText({ content, isStreaming, className }: StreamingTextProps) {
  const endRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom while new content arrives
  React.useEffect(() => {
    if (isStreaming) {
      endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [content, isStreaming])

  return (
    <div
      className={cn(
        'font-mono text-forge-sm text-[var(--color-fg)] leading-relaxed',
        'whitespace-pre-wrap break-words',
        className,
      )}
      aria-live={isStreaming ? 'polite' : undefined}
      aria-label={isStreaming ? 'Generating content…' : undefined}
    >
      {content}
      {isStreaming && (
        <span
          className="inline-block w-[0.55em] h-[1.1em] bg-[var(--color-accent)] ml-0.5 align-text-bottom animate-[blink_1s_step-end_infinite]"
          aria-hidden="true"
        />
      )}
      <div ref={endRef} />
    </div>
  )
}
