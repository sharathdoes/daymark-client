'use client'

import Link from 'next/link'

type NavTab = 'today' | 'quiz' | 'subscribe'

export default function NavStrip({ active }: { active: NavTab }) {
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).toUpperCase()

  return (
    <div className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-30">
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <div className="flex items-end">
          {([
            { id: 'today', label: 'TODAY', href: '/today' },
            { id: 'quiz', label: 'QUIZ', href: '/quiz' },
            { id: 'subscribe', label: 'SUBSCRIBE', href: '/subscribe' },
          ] as { id: NavTab; label: string; href: string }[]).map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`font-mono text-[11px] tracking-[0.18em] px-5 py-4 border-b-2 transition-all duration-150 ${
                active === tab.id
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </Link>
          ))}
          <div className="ml-auto flex items-center py-4">
            <Link
              href="/daily"
              className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-muted-foreground hover:text-primary transition-colors"
            >
              <span className="pulse-amber w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              DAILY
            </Link>
            <span className="mx-4 text-border text-xs">·</span>
            <span className="font-mono text-[10px] text-muted-foreground">{today}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
