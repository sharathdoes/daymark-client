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
      <main className="flex-1 flex items-center">
        <div className="w-full max-w-2xl mx-auto px-4 py-10 md:py-14">

          {/* Masthead */}
          <header className="border-y-2 border-foreground py-3 flex items-center justify-between flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] bg-foreground text-background px-2 py-0.5">
              <span className="pulse-soft size-1.5 rounded-full bg-red-500 inline-block" />
              BREAKING
            </span>
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.03em] leading-none">
              Quiz of the Day.
            </h1>
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{todayFormatted}</span>
          </header>

          <p className="border-b-2 border-foreground py-3 px-1 text-sm text-muted-foreground leading-relaxed">
            One quiz every day at 6 AM, pulled from real articles across all categories. Everyone plays the same questions. No setup needed.
          </p>

          {/* Content */}
          {isLoading ? (
            <div className="border-b-2 border-foreground py-8 font-mono text-[11px] tracking-[0.22em] text-muted-foreground animate-pulse">
              LOADING TODAY&apos;S QUIZ…
            </div>
          ) : error ? (
            <div className="border-b-2 border-destructive py-3 px-1 font-mono text-[11px] tracking-[0.18em] text-destructive">
              {error}
            </div>
          ) : quiz === null ? (
            <div className="border-b-2 border-foreground py-8 px-1 text-center space-y-3">
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">NOT YET AVAILABLE</p>
              <p className="font-display font-bold text-xl md:text-2xl tracking-[-0.02em]">No quiz for today — yet.</p>
              <p className="text-sm text-muted-foreground">
                Today&apos;s quiz is generated every day at <strong className="text-foreground">6:00 AM IST</strong>. Check back soon.
              </p>
              <Link
                href="/"
                className="inline-block font-mono text-[10px] tracking-[0.18em] border-2 border-foreground/20 px-4 py-2 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors mt-2"
              >
                BUILD YOUR OWN QUIZ →
              </Link>
            </div>
          ) : (
            <div className="border-b-2 border-foreground">
              <div className="px-5 py-3 border-b-2 border-foreground flex items-center justify-between">
                <div>
                  <h2 className="font-display font-semibold text-lg tracking-[-0.02em]">{quiz.title}</h2>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground mt-0.5">
                    {quiz.questions.length} QUESTIONS · {quiz.difficulty.toUpperCase()}
                  </p>
                </div>
                <span className="font-mono text-[10px] tracking-[0.18em] border-2 border-foreground px-2 py-0.5">
                  DAILY
                </span>
              </div>

              <div className="grid grid-cols-3 border-b-2 border-foreground">
                {[
                  { label: 'QUESTIONS', value: quiz.questions.length },
                  { label: 'DIFFICULTY', value: quiz.difficulty.toUpperCase() },
                  { label: 'CATEGORIES', value: quiz.category_ids?.length ?? '—' },
                ].map((stat, i) => (
                  <div key={stat.label} className={`px-4 py-4 text-center ${i < 2 ? 'border-r-2 border-foreground' : ''}`}>
                    <p className="font-display font-bold text-2xl md:text-3xl tracking-[-0.02em] tabular-nums">{stat.value}</p>
                    <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {!isAuthenticated ? (
                  <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground">
                    <Link href="/login" className="text-foreground underline underline-offset-4">SIGN IN</Link>
                    {' '}to track streaks and results.
                  </p>
                ) : <div />}
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={isStarting}
                  className="font-mono text-[10px] tracking-[0.2em] px-5 py-2.5 bg-foreground text-background hover:bg-foreground/85 transition-colors disabled:opacity-60"
                >
                  {isStarting ? 'STARTING…' : "START TODAY'S QUIZ →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
