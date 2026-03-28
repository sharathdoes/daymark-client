"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useQuiz } from '@/lib/store'
import { signIn, loginWithGoogle, loginWithGithub, generateQuiz, getToken } from '@/lib/api'
import type { QuizSession } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gradient-to-br from-background via-purple-50/10 to-pink-50/10 px-4 py-12 relative overflow-hidden">
      {/* Decorative blur elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-purple-200/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute -bottom-20 left-10 w-60 h-60 bg-gradient-to-tr from-pink-200/20 to-transparent rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-serif font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-base">
              Sign in to continue playing and track your scores
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 backdrop-blur-sm px-5 py-4 text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground" htmlFor="email">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-8"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gradient-to-br from-background to-secondary px-3 text-muted-foreground font-medium">or sign in with</span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full font-semibold"
              onClick={loginWithGoogle}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full font-semibold"
              onClick={loginWithGithub}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 . 405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.016 12.016 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </Button>
          </div>

          {/* Legal text */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            By signing in, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            .
          </p>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
