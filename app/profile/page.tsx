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
      <main className="flex-1 flex items-center px-4 py-10 md:py-14">
        <div className="w-full max-w-3xl mx-auto space-y-8">

          {/* Profile header */}
          <header className="border-y-2 border-foreground py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-foreground">
                  <AvatarImage
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user?.email || 'user')}`}
                    alt={user?.name || 'Profile'}
                  />
                  <AvatarFallback className="font-display font-bold text-lg bg-muted">
                    {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-display font-bold text-2xl md:text-3xl tracking-[-0.02em] leading-none">
                    {isLoading ? '…' : user?.name || 'Reader'}
                  </h1>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground mt-1">
                    {user?.email} · {user?.provider?.toUpperCase()} ACCOUNT
                  </p>
                  {user?.created_at && (
                    <p className="font-mono text-[10px] text-muted-foreground tracking-[0.16em] mt-0.5">
                      JOINED {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] border-2 border-foreground/20 px-2.5 py-1.5 text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
              >
                <LogOut className="h-3 w-3" />
                SIGN OUT
              </button>
            </div>
          </header>

          {error && (
            <div className="border-b-2 border-destructive py-2 px-1 font-mono text-[11px] tracking-[0.16em] text-destructive">
              {error}
            </div>
          )}

          {/* Stats */}
          {!isLoading && totalQuizzes > 0 && (
            <div className="grid grid-cols-3 border-b-2 border-foreground">
              {[
                { label: 'QUIZZES TAKEN', value: totalQuizzes },
                { label: 'AVG SCORE', value: `${avgScore}%` },
                { label: 'BEST SCORE', value: `${bestScore}%` },
              ].map((stat, i) => (
                <div key={stat.label} className={`px-4 py-4 text-center ${i < 2 ? 'border-r-2 border-foreground' : ''}`}>
                  <p className="font-display font-bold text-2xl md:text-3xl tracking-[-0.02em] tabular-nums">{stat.value}</p>
                  <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* History */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">QUIZ HISTORY</span>
              <div className="flex-1 h-px bg-foreground/20" />
            </div>

            {isLoading ? (
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground animate-pulse">LOADING…</p>
            ) : quizHistory.length === 0 ? (
              <div className="border-2 border-foreground/20 px-5 py-8 text-center">
                <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground mb-2">NO QUIZZES YET</p>
                <p className="text-sm text-muted-foreground">Your completed quizzes will appear here.</p>
              </div>
            ) : (
              <div className="border-2 border-foreground">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-3 py-2 bg-foreground text-background">
                  {['DATE', 'SCORE', 'DIFFICULTY', 'TOPICS', ''].map((h) => (
                    <span key={h} className="font-mono text-[10px] tracking-[0.18em]">{h}</span>
                  ))}
                </div>
                {quizHistory.map((quiz, i) => {
                  const pct = Math.round((quiz.score / quiz.total_questions) * 100)
                  return (
                    <div key={quiz.id} className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center px-3 py-2.5 hover:bg-muted transition-colors ${i > 0 ? 'border-t border-foreground/20' : ''}`}>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {new Date(quiz.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className={`font-mono text-[11px] font-semibold ${pct >= 80 ? 'text-emerald-500' : pct >= 50 ? 'text-foreground' : 'text-destructive'}`}>
                        {quiz.score}/{quiz.total_questions}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">{quiz.difficulty}</span>
                      <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[120px]">{quiz.categories || 'GENERAL'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const url = `${window.location.origin}/quiz/${quiz.quiz_id}`
                          navigator.clipboard.writeText(url)
                          setCopiedId(quiz.id)
                          setTimeout(() => setCopiedId(null), 2000)
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
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
