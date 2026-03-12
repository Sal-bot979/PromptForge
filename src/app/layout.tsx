import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | PromptForge',
    default: 'PromptForge — AI Workflow Automation for Serious Builders',
  },
  description:
    'Describe once. Deploy everywhere. Never repeat yourself again. PromptForge generates your complete prompt workflow — PRD, architecture, Claude Code kickoff — from a single project description.',
  keywords: ['AI', 'prompt engineering', 'Claude', 'LLM', 'developer tools', 'PRD', 'workflow'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[var(--color-bg)] text-[var(--color-fg)] font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
