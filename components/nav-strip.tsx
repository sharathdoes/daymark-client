'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavTab = 'today' | 'quiz' | 'subscribe'

const TABS: { id: NavTab; label: string; href: string }[] = [
  { id: 'today', label: 'Today', href: '/today' },
  { id: 'quiz', label: 'Quiz', href: '/quiz' },
  { id: 'subscribe', label: 'Subscribe', href: '/subscribe' },
]

export default function NavStrip({ active }: { active: NavTab }) {
  const pathname = usePathname()
  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).toUpperCase()

  return (
    <div className="sticky top-0 bg-background/95 backdrop-blur-md z-30 border-b border-foreground/20">
      <div className="max-w-6xl mx-auto px-5 md:px-10">
        <div className="flex items-center h-12">
          <Link href="/" className="flex items-baseline gap-2 mr-8 hover:opacity-80 transition-opacity">
            <span className="font-display font-bold text-xl tracking-[-0.03em]">Daymark</span>
          </Link>
          <nav className="flex items-center">
            {TABS.map((tab) => {
              const isActive = pathname === tab.href || active === tab.id
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`relative font-mono text-[11px] tracking-[0.2em] uppercase px-3 py-1.5 transition-colors ${
                    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute left-3 right-3 -bottom-[13px] h-0.5 bg-foreground" />
                  )}
                </Link>
              )
            })}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/daily"
              className="hidden md:flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="pulse-soft w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
              Daily
            </Link>
            <span className="hidden md:inline font-mono text-[10px] tracking-[0.18em] text-muted-foreground">{today}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
