'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getDailyQuiz } from '@/lib/api'
import { useAuth, useQuiz } from '@/lib/store'
import { Quiz, QuizSession } from '@/lib/types'

export default function DailyQuizPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { setSession } = useQuiz()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isStarting, setIsStarting] = useState(false)


  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDailyQuiz()
        setQuiz(data)
      } catch (err) {
        setError('Failed to load today\'s quiz.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleStart = () => {
    if (!quiz) return

    if (!isAuthenticated) {
      router.push('/login?redirect=/daily')
      return
    }

    setIsStarting(true)
    const session: QuizSession = {
      quiz,
      currentIndex: 0,
      answers: Array(quiz.questions.length).fill(null),
      score: 0,
      completed: false,
      timerOption: 'none',
      timerSeconds: 0,
    }
    setSession(session)
    router.push('/quiz')
  }

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).toUpperCase()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-10 md:py-14">

          {/* Masthead */}
          <section className="animate-slide-up mb-10" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] bg-primary text-primary-foreground px-3 py-1">
                <span className="pulse-amber w-1.5 h-1.5 rounded-full bg-primary-foreground inline-block" />
                BREAKING
              </span>
              <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">{todayFormatted}</span>
            </div>
            <div className="border-t-2 border-foreground pt-4">
              <h1 className="font-display text-4xl md:text-5xl leading-tight text-foreground mb-3">
                Today&apos;s<br />Quiz of the Day
              </h1>
              <p className="text-sm text-muted-foreground border-l-2 border-border pl-4 leading-relaxed">
                One quiz every day at 6 AM, pulled from real articles across all categories.
                Everyone plays the same questions. No setup needed.
              </p>
            </div>
          </section>

          {/* Content */}
          {isLoading ? (
            <div className="font-mono text-xs tracking-widest text-muted-foreground animate-pulse animate-slide-up py-8">
              LOADING TODAY&apos;S QUIZ...
            </div>
          ) : error ? (
            <div className="animate-slide-up border-l-2 border-destructive bg-destructive/5 px-4 py-3 font-mono text-xs text-destructive">
              {error}
            </div>
          ) : quiz === null ? (
            <div className="animate-slide-up border border-border p-8 text-center space-y-4">
              <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">NOT YET AVAILABLE</p>
              <p className="font-display text-2xl text-foreground">No quiz for today — yet.</p>
              <p className="text-sm text-muted-foreground">
                Today&apos;s quiz is generated every day at <strong className="text-foreground">6:00 AM IST</strong>. Check back soon.
              </p>
              <Link
                href="/"
                className="inline-block font-mono text-[11px] tracking-[0.14em] border border-border px-5 py-2.5 text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors mt-2"
              >
                BUILD YOUR OWN QUIZ →
              </Link>
            </div>
          ) : (
            <div className="animate-slide-up space-y-6" style={{ animationDelay: '80ms' }}>
              {/* Quiz card */}
              <div className="border border-border">
                <div className="border-b border-border px-5 py-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-medium text-foreground">{quiz.title}</h2>
                    <p className="font-mono text-[10px] tracking-wide text-muted-foreground mt-0.5">
                      {quiz.questions.length} QUESTIONS · {quiz.difficulty.toUpperCase()}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.16em] border border-primary/40 text-primary px-2.5 py-1">
                    DAILY
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                  {[
                    { label: 'QUESTIONS', value: quiz.questions.length },
                    { label: 'DIFFICULTY', value: quiz.difficulty.toUpperCase() },
                    { label: 'CATEGORIES', value: quiz.category_ids?.length ?? '—' },
                  ].map((stat) => (
                    <div key={stat.label} className="px-5 py-4 text-center">
                      <p className="font-display text-3xl text-foreground">{stat.value}</p>
                      <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {!isAuthenticated && (
                    <p className="font-mono text-[10px] text-muted-foreground">
                      <Link href="/login" className="text-primary hover:underline underline-offset-4">SIGN IN</Link>
                      {' '}to track streaks and results.
                    </p>
                  )}
                  {isAuthenticated && <div />}
                  <button
                    type="button"
                    onClick={handleStart}
                    disabled={isStarting}
                    className="font-mono text-[11px] tracking-[0.18em] px-6 py-3 border border-primary bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {isStarting ? 'STARTING...' : "START TODAY'S QUIZ →"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
