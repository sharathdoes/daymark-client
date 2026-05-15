"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useAuth, useQuiz } from '@/lib/store'
import { signIn, loginWithGoogle, loginWithGithub, generateQuiz } from '@/lib/api'
import type { QuizSession } from '@/lib/types'
import { BlurFade } from '@/components/ui/blur-fade'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuth()
  const { setSession } = useQuiz()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
        const categoryIds = categoriesParam.split(',').map(Number).filter(id => !Number.isNaN(id))
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
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5 py-10">
      <BlurFade inView className="w-full max-w-md">
        <header className="border-y-2 border-foreground py-4 mb-0">
          <div className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground text-center">SUBSCRIBER ENTRY</div>
          <h1 className="font-display font-extrabold text-5xl md:text-6xl tracking-[-0.04em] leading-[0.9] text-center mt-2">
            Sign in.
          </h1>
        </header>

        {error && (
          <div className="border-b-2 border-destructive py-3 px-3 font-mono text-[11px] tracking-[0.18em] text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-b-2 border-foreground">
          <label htmlFor="email" className="block border-b-2 border-foreground px-5 py-4">
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground block mb-2">EMAIL</span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full bg-transparent border-0 outline-none font-display text-2xl tracking-[-0.025em] placeholder:text-muted-foreground/40"
            />
          </label>
          <label htmlFor="password" className="block border-b-2 border-foreground px-5 py-4">
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground block mb-2">PASSWORD</span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full bg-transparent border-0 outline-none font-display text-2xl tracking-[-0.025em] placeholder:text-muted-foreground/40"
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full px-5 py-4 flex items-center justify-between gap-3 transition-colors group',
              isLoading ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-foreground text-background hover:bg-foreground/85'
            )}
          >
            <span className="font-display font-bold text-2xl tracking-[-0.025em]">
              {isLoading ? 'Signing in…' : 'Continue'}
            </span>
            <ArrowUpRight className="size-6 group-hover:rotate-12 transition-transform" />
          </button>
        </form>

        <div className="border-b-2 border-foreground grid grid-cols-2">
          <button type="button" onClick={loginWithGoogle} className="px-5 py-4 font-mono text-[10px] tracking-[0.22em] hover:bg-muted transition-colors border-r-2 border-foreground">
            CONTINUE WITH GOOGLE
          </button>
          <button type="button" onClick={loginWithGithub} className="px-5 py-4 font-mono text-[10px] tracking-[0.22em] hover:bg-muted transition-colors">
            CONTINUE WITH GITHUB
          </button>
        </div>

        <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground text-center py-5">
          NO ACCOUNT?{' '}
          <Link href="/signup" className="text-foreground hover:opacity-80 underline underline-offset-4">
            SIGN UP
          </Link>
        </p>
      </BlurFade>
    </div>
  )
}
