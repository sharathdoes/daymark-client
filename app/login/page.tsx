"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useQuiz } from '@/lib/store'
import { signIn, loginWithGoogle, loginWithGithub, generateQuiz, getToken } from '@/lib/api'
import type { QuizSession } from '@/lib/types'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuth()
  const { setSession } = useQuiz()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // After OAuth redirect, the user lands back here authenticated.
  // Read pendingQuiz from localStorage and auto-generate the quiz.
  const { isAuthenticated } = useAuth()
  useEffect(() => {
    if (!isAuthenticated) return
    const raw = localStorage.getItem('pendingQuiz')
    if (!raw) return
    localStorage.removeItem('pendingQuiz')
    const pending = JSON.parse(raw)
    setIsLoading(true)
    generateQuiz({
      category_ids: pending.categories,
      difficulty: pending.difficulty,
      number_of_questions: pending.count,
    }).then(quiz => {
      const session: QuizSession = {
        quiz,
        currentIndex: 0,
        answers: Array(quiz.questions.length).fill(null),
        score: 0,
        completed: false,
        timerOption: pending.timer ?? 'none',
        timerSeconds: pending.timer && pending.timer !== 'none' ? parseInt(pending.timer, 10) * 60 : 0,
      }
      setSession(session)
      router.push('/quiz')
    }).catch(() => {
      router.push('/')
    }).finally(() => setIsLoading(false))
  }, [isAuthenticated, router, setSession])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await signIn({ email, password })
      setAuth(response.user, response.token)
      const categoriesParam = searchParams.get('categories')
      const difficultyParam = searchParams.get('difficulty')
      const countParam = searchParams.get('count')

      if (categoriesParam && difficultyParam) {
        const categoryIds = categoriesParam
          .split(',')
          .map(Number)
          .filter(id => !Number.isNaN(id))

        try {
          const quiz = await generateQuiz({
            category_ids: categoryIds,
            difficulty: difficultyParam,
            number_of_questions: countParam ? Number(countParam) : 10,
          })

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
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to start quiz')
          router.push('/')
        }
      } else {
        router.push('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm animate-slide-up">

        {/* Header */}
        <div className="mb-7 border-t-2 border-foreground pt-4">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-0.5 h-5 bg-primary block" />
            <span className="font-mono text-[10px] tracking-[0.22em] text-primary">DAYMARK</span>
          </div>
          <h1 className="font-display text-3xl text-foreground">Sign in</h1>
          <p className="font-mono text-[11px] text-muted-foreground mt-1 tracking-wide">
            Continue where you left off.
          </p>
        </div>

        {error && (
          <div className="mb-5 border-l-2 border-destructive bg-destructive/5 px-4 py-2.5 font-mono text-[11px] text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="space-y-1">
            <label className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground" htmlFor="email">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full bg-background border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground" htmlFor="password">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full bg-background border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full font-mono text-[11px] tracking-[0.18em] px-4 py-3 border border-primary bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 mt-1"
          >
            {isLoading ? 'SIGNING IN...' : 'SIGN IN →'}
          </button>
        </form>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-border" />
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="space-y-2 mb-6">
          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full font-mono text-[11px] tracking-[0.14em] px-4 py-3 border border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
          >
            CONTINUE WITH GOOGLE
          </button>
          <button
            type="button"
            onClick={loginWithGithub}
            className="w-full font-mono text-[11px] tracking-[0.14em] px-4 py-3 border border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
          >
            CONTINUE WITH GITHUB
          </button>
        </div>

        <p className="font-mono text-[10px] text-muted-foreground text-center tracking-wide">
          NO ACCOUNT?{' '}
          <Link href="/signup" className="text-primary hover:underline underline-offset-4">
            SIGN UP
          </Link>
        </p>
      </div>
    </div>
  )
}
