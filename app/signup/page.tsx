"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useQuiz } from '@/lib/store'
import { signUp, verifyEmailSignUp, loginWithGoogle, loginWithGithub, generateQuiz } from '@/lib/api'
import type { QuizSession } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuth()
  const { setSession } = useQuiz()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [pendingEmail, setPendingEmail] = useState('')
  const [devOtp, setDevOtp] = useState<string | undefined>(undefined)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await signUp({ name, email, password })
      setPendingEmail(res.email)
      setDevOtp(res.dev_otp)
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await verifyEmailSignUp(pendingEmail || email, otp)
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
      setError(err instanceof Error ? err.message : 'Failed to verify email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/10 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-serif font-bold text-foreground">
              Create account
            </h1>
            <p className="text-muted-foreground">
              Join to save your quiz progress
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Form */}
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-foreground" htmlFor="name">
                  Full name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Taylor"
                  required
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-medium text-foreground" htmlFor="email">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-medium text-foreground" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Sending code…' : 'Continue'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm text-foreground">
                  We&apos;ve sent a verification code to{" "}
                  <span className="font-semibold">{pendingEmail || email}</span>
                </p>
                {devOtp && (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                    Dev: <span className="font-mono font-semibold">{devOtp}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-medium text-foreground" htmlFor="otp">
                  Verification code
                </label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  required
                  className="text-center text-lg tracking-widest font-mono"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying…' : 'Verify & create'}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">or sign up with</span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="space-y-2.5">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={loginWithGoogle}
            >
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={loginWithGithub}
            >
              GitHub
            </Button>
          </div>

          {/* Legal text */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            By signing up, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            .
          </p>

          {/* Sign in link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
