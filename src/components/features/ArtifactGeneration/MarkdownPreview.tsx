'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface MarkdownPreviewProps {
  content: string
  className?: string
}

/**
 * Lightweight markdown-to-HTML renderer for artifact preview.
 *
 * Handles the patterns Claude produces in artifact output:
 * - ATX headings (## heading)
 * - Bold (**text**) and italic (*text*)
 * - Inline code (`code`) and fenced code blocks (```lang\n...\n```)
 * - Unordered lists (- item) and ordered lists (1. item)
 * - Checkboxes (- [ ] item, - [x] item)
 * - Tables (| col | col |)
 * - Blockquotes (> text)
 * - Horizontal rules (---)
 * - Paragraphs (double newline)
 *
 * No external dependencies — pure regex/DOM manipulation for bundle size control.
 */
export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const html = React.useMemo(() => renderMarkdown(content), [content])

  return (
    <div
      className={cn('forge-markdown', className)}
      // Content is rendered from Claude output — safe to use dangerouslySetInnerHTML
      // in this controlled context since it never comes from user-supplied HTML.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// ─── Inline styles injected once via <style> ──────────────────────────────────

export function MarkdownStyles() {
  return (
    <style>{`
      .forge-markdown {
        font-size: 0.875rem;
        line-height: 1.7;
        color: var(--color-fg);
      }
      .forge-markdown h1,
      .forge-markdown h2,
      .forge-markdown h3,
      .forge-markdown h4 {
        font-weight: 600;
        letter-spacing: -0.01em;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        color: var(--color-fg);
        line-height: 1.3;
      }
      .forge-markdown h1 { font-size: 1.25rem; }
      .forge-markdown h2 { font-size: 1.1rem; }
      .forge-markdown h3 { font-size: 1rem; color: var(--color-fg-muted); }
      .forge-markdown h4 { font-size: 0.875rem; color: var(--color-fg-muted); text-transform: uppercase; letter-spacing: 0.05em; }
      .forge-markdown p { margin-bottom: 0.85em; }
      .forge-markdown ul,
      .forge-markdown ol { padding-left: 1.5em; margin-bottom: 0.85em; }
      .forge-markdown li { margin-bottom: 0.3em; }
      .forge-markdown li input[type="checkbox"] { margin-right: 0.4em; accent-color: var(--color-accent); }
      .forge-markdown strong { font-weight: 600; color: var(--color-fg); }
      .forge-markdown em { font-style: italic; color: var(--color-fg-muted); }
      .forge-markdown code {
        font-family: var(--font-mono);
        font-size: 0.8125rem;
        background: var(--color-surface-3);
        border: 1px solid var(--color-border);
        border-radius: 3px;
        padding: 0.1em 0.35em;
      }
      .forge-markdown pre {
        background: var(--color-surface-3);
        border: 1px solid var(--color-border);
        border-radius: 0.375rem;
        padding: 1em;
        overflow-x: auto;
        margin-bottom: 1em;
      }
      .forge-markdown pre code {
        background: none;
        border: none;
        padding: 0;
        font-size: 0.8125rem;
        line-height: 1.6;
      }
      .forge-markdown blockquote {
        border-left: 3px solid var(--color-accent);
        padding-left: 1em;
        color: var(--color-fg-muted);
        margin: 1em 0;
        font-style: italic;
      }
      .forge-markdown table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1em;
        font-size: 0.8125rem;
      }
      .forge-markdown th,
      .forge-markdown td {
        border: 1px solid var(--color-border);
        padding: 0.5em 0.75em;
        text-align: left;
      }
      .forge-markdown th {
        background: var(--color-surface-2);
        font-weight: 600;
        color: var(--color-fg-muted);
      }
      .forge-markdown tr:nth-child(even) td { background: var(--color-surface); }
      .forge-markdown hr {
        border: none;
        border-top: 1px solid var(--color-border);
        margin: 1.5em 0;
      }
      .forge-markdown a { color: var(--color-accent); text-decoration: underline; }
    `}</style>
  )
}

// ─── Renderer ────────────────────────────────────────────────────────────────

function renderMarkdown(raw: string): string {
  let md = raw

  // Escape HTML to prevent XSS from any user-edited content
  md = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Fenced code blocks (must come before inline code)
  md = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langAttr = lang ? ` class="language-${lang}"` : ''
    return `<pre><code${langAttr}>${code.trimEnd()}</code></pre>`
  })

  // Headings
  md = md.replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>')
  md = md.replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>')
  md = md.replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>')
  md = md.replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>')

  // Horizontal rule
  md = md.replace(/^-{3,}$/gm, '<hr>')

  // Blockquote
  md = md.replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>')

  // Tables — find table blocks and convert them
  md = md.replace(
    /(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)+)/g,
    (table) => {
      const rows = table.trim().split('\n')
      const header = rows[0]
      const body = rows.slice(2) // skip separator row

      const toCell = (row: string, tag: string) =>
        row
          .split('|')
          .slice(1, -1)
          .map((cell) => `<${tag}>${cell.trim()}</${tag}>`)
          .join('')

      return `<table><thead><tr>${toCell(header, 'th')}</tr></thead><tbody>${body
        .map((r) => `<tr>${toCell(r, 'td')}</tr>`)
        .join('')}</tbody></table>`
    },
  )

  // Checkboxes (must come before list processing)
  md = md.replace(/^- \[ \] (.+)$/gm, '<li><input type="checkbox" disabled> $1</li>')
  md = md.replace(/^- \[x\] (.+)$/gim, '<li><input type="checkbox" checked disabled> $1</li>')

  // Unordered lists
  md = md.replace(/^[-*] (.+)$/gm, '<li>$1</li>')
  // Wrap consecutive <li> blocks in <ul>
  md = md.replace(/(<li>.*<\/li>\n?)+/g, (block) => `<ul>${block}</ul>`)

  // Ordered lists
  md = md.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  md = md.replace(/(<li>.*<\/li>\n?)+/g, (block) => {
    if (block.includes('<ul>')) return block
    return `<ol>${block}</ol>`
  })

  // Inline code (after fenced blocks)
  md = md.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Bold and italic
  md = md.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  md = md.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Links
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Paragraphs: double newline → <p>
  md = md
    .split(/\n{2,}/)
    .map((block) => {
      // Don't wrap already-tagged blocks
      if (/^<(h[1-6]|ul|ol|pre|table|blockquote|hr)/.test(block.trim())) return block
      if (!block.trim()) return ''
      return `<p>${block.replace(/\n/g, ' ')}</p>`
    })
    .join('\n')

  return md
}
