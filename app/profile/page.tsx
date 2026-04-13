'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/store'
import { getMe, getQuizHistory } from '@/lib/api'
import { UserQuizResult } from '@/lib/types'
import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LinkIcon, Check } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser, clearAuth, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [quizHistory, setQuizHistory] = useState<UserQuizResult[]>([])
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    // Fetch user and quiz history
    const loadData = async () => {
      try {
        if (!user) {
          const userData = await getMe()
          setUser(userData)
        }
        
        if (isAuthenticated) {
          const history = await getQuizHistory()
          setQuizHistory(history)
        }
      } catch (err) {
        console.error('Failed to load profile data:', err)
        setError('Failed to load profile.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, setUser, isAuthenticated])

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  const totalQuizzes = quizHistory.length
  const avgScore = totalQuizzes > 0
    ? Math.round(quizHistory.reduce((sum, q) => sum + (q.score / q.total_questions) * 100, 0) / totalQuizzes)
    : 0
  const bestScore = totalQuizzes > 0
    ? Math.max(...quizHistory.map(q => Math.round((q.score / q.total_questions) * 100)))
    : 0

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-4 py-10 md:py-14">
        <div className="w-full max-w-3xl mx-auto space-y-8">

          {/* Profile header */}
          <div className="animate-slide-up border-t-2 border-foreground pt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border border-border">
                  <AvatarImage
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user?.email || 'user')}`}
                    alt={user?.name || 'Profile'}
                  />
                  <AvatarFallback className="font-display text-xl bg-muted">
                    {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-display text-3xl text-foreground">
                    {isLoading ? '...' : user?.name || 'Reader'}
                  </h1>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground mt-1">
                    {user?.email} · {user?.provider?.toUpperCase()} ACCOUNT
                  </p>
                  {user?.created_at && (
                    <p className="font-mono text-[10px] text-muted-foreground tracking-wide mt-0.5">
                      JOINED {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] border border-border px-3 py-2 text-muted-foreground hover:border-destructive/60 hover:text-destructive transition-colors"
              >
                <LogOut className="h-3 w-3" />
                SIGN OUT
              </button>
            </div>

            {error && (
              <div className="mt-4 border-l-2 border-destructive bg-destructive/5 px-4 py-2.5 font-mono text-[11px] text-destructive">
                {error}
              </div>
            )}
          </div>

          {/* Stats */}
          {!isLoading && totalQuizzes > 0 && (
            <div className="animate-slide-up grid grid-cols-3 divide-x divide-border border border-border" style={{ animationDelay: '80ms' }}>
              {[
                { label: 'QUIZZES TAKEN', value: totalQuizzes },
                { label: 'AVG SCORE', value: `${avgScore}%` },
                { label: 'BEST SCORE', value: `${bestScore}%` },
              ].map((stat) => (
                <div key={stat.label} className="px-4 py-5 text-center">
                  <p className="font-display text-4xl text-foreground">{stat.value}</p>
                  <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* History */}
          <section className="animate-slide-up" style={{ animationDelay: '160ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">QUIZ HISTORY</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {isLoading ? (
              <p className="font-mono text-xs text-muted-foreground tracking-widest animate-pulse">LOADING...</p>
            ) : quizHistory.length === 0 ? (
              <div className="border border-border px-5 py-8 text-center">
                <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground mb-2">NO QUIZZES YET</p>
                <p className="text-sm text-muted-foreground">Your completed quizzes will appear here.</p>
              </div>
            ) : (
              <div className="border border-border divide-y divide-border">
                {/* Header */}
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 bg-muted/30">
                  {['DATE', 'SCORE', 'DIFFICULTY', 'TOPICS', ''].map((h) => (
                    <span key={h} className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">{h}</span>
                  ))}
                </div>
                {quizHistory.map(quiz => {
                  const pct = Math.round((quiz.score / quiz.total_questions) * 100)
                  return (
                    <div key={quiz.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3 hover:bg-muted/20 transition-colors">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {new Date(quiz.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className={`font-mono text-[11px] font-semibold ${pct >= 80 ? 'text-emerald-500' : pct >= 50 ? 'text-primary' : 'text-destructive'}`}>
                        {quiz.score}/{quiz.total_questions}
                      </span>
                      <span className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">{quiz.difficulty}</span>
                      <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[120px]">{quiz.categories || 'GENERAL'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/quiz/${quiz.quiz_id}`
                          navigator.clipboard.writeText(url)
                          setCopiedId(quiz.id)
                          setTimeout(() => setCopiedId(null), 2000)
                        }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {copiedId === quiz.id
                          ? <Check className="w-3 h-3 text-emerald-500" />
                          : <LinkIcon className="w-3 h-3" />}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
