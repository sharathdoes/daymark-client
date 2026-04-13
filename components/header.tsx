'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, useTheme } from '@/lib/store'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Moon, Sun, LogOut, Github } from 'lucide-react'

const TICKER_ITEMS = [
  'POLITICS', 'SCIENCE', 'TECHNOLOGY', 'BUSINESS', 'SPORTS',
  'CULTURE', 'WORLD', 'HEALTH', 'CLIMATE', 'MARKETS',
]

interface HeaderProps {
  hideAuth?: boolean
}

export default function Header({ hideAuth = false }: HeaderProps) {
  const router = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuth()
  const { isDark, setIsDark } = useTheme()

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  const tickerContent = [...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
    <span key={i} className="flex items-center gap-4 pr-8">
      <span className="text-primary font-semibold tracking-widest text-[10px]">{item}</span>
      <span className="text-border/60 text-[10px]">·</span>
    </span>
  ))

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Main bar */}
      <div className="max-w-5xl mx-auto flex items-center justify-between h-11 px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-0.5 h-5 bg-primary block" />
          <span className="font-mono text-xs font-semibold tracking-[0.22em] uppercase text-foreground group-hover:text-primary transition-colors">
            DAYMARK
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="https://github.com/sharathdoes/daymark"
            target="_blank"
            className="hidden md:flex items-center gap-1.5 text-[11px] tracking-wide font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-3 w-3" />
            <span>STAR</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>

          {!hideAuth && (
            <>
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <Link href="/profile" className="flex items-center gap-2 group">
                    <Avatar className="h-5 w-5">
                      <AvatarImage
                        src={user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email || 'user')}`}
                        alt={user.name || user.email || 'User'}
                      />
                      <AvatarFallback className="text-[9px] bg-muted">
                        {(user.name || user.email || '?').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline font-mono text-[11px] tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                      {user.name || user.email}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Log out"
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    <LogOut className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="font-mono text-[11px] tracking-[0.12em] uppercase text-foreground border border-border px-3 py-1 hover:border-primary hover:text-primary transition-colors"
                >
                  Sign in
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ticker strip */}
      <div className="border-t border-border/50 overflow-hidden h-6 flex items-center bg-muted/30">
        <div className="flex-shrink-0 flex items-center gap-2 px-3 border-r border-border h-full bg-primary">
          <span className="text-primary-foreground font-mono font-semibold text-[9px] tracking-[0.2em]">LIVE</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="ticker-track">
            {tickerContent}
          </div>
        </div>
      </div>
    </header>
  )
}