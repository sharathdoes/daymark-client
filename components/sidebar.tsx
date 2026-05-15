'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, useTheme } from '@/lib/store'
import { Moon, Sun, LogOut } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export default function Sidebar() {
  const router = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuth()
  const { isDark, setIsDark } = useTheme()

  return (
    <>
      {/* Desktop spine */}
      <aside className="fixed left-0 top-0 bottom-0 w-10 border-r border-border hidden md:flex flex-col items-center py-5 z-40 bg-background">
        <Link href="/" className="group flex items-center justify-center">
          <span
            className="font-mono text-[9px] tracking-[0.22em] text-muted-foreground group-hover:text-foreground transition-colors select-none"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            DAYMARK
          </span>
        </Link>

        <div className="flex-1" />

        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
          </button>

          {isAuthenticated && user ? (
            <>
              <Link href="/profile" title={user.name || user.email || 'Profile'}>
                <Avatar className="h-5 w-5">
                  <AvatarImage
                    src={user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email || 'user')}`}
                    alt={user.name || user.email || 'User'}
                  />
                  <AvatarFallback className="text-[8px] bg-muted">
                    {(user.name || user.email || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <button
                type="button"
                onClick={() => { clearAuth(); router.push('/') }}
                aria-label="Sign out"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut size={12} />
              </button>
            </>
          ) : (
            <Link href="/login" title="Sign in">
              <span
                className="font-mono text-[8px] tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                style={{ writingMode: 'vertical-rl' }}
              >
                SIGN IN
              </span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile top strip */}
      <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-border bg-background">
        <Link href="/" className="font-semibold text-sm tracking-tight hover:opacity-80 transition-opacity">
          Daymark
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          {isAuthenticated && user ? (
            <Link href="/profile">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={user.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email || 'user')}`}
                  alt={user.name || user.email || 'User'}
                />
                <AvatarFallback className="text-[8px] bg-muted">
                  {(user.name || user.email || '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
