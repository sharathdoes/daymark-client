'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'

interface HeaderProps {
  hideAuth?: boolean
}

export default function Header({ hideAuth = false }: HeaderProps) {
  const router = useRouter()
  const { user, isAuthenticated, clearAuth } = useAuth()

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm shadow-sm sticky top-0 z-40">
      <div className="max-w-4xl mx-auto flex items-center justify-between h-14 px-4 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold font-serif text-foreground hover:text-primary transition-colors"
        >
          Daymark
        </Link>

        {/* Right actions */}
        {!hideAuth && (
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={
                        user.avatar_url ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.email || 'user')}`
                      }
                      alt={user.name || user.email || 'User avatar'}
                    />
                    <AvatarFallback className="text-xs">
                      {(user.name || user.email || '?').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm text-muted-foreground">
                    {user.name || user.email}
                  </span>
                </Link>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleLogout}
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button type="button" variant="default" size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
