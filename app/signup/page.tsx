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
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Log in or create an account
            </h1>
          </div>

          {error && (
            <div className="rounded-sm border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Form */}
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="name">
                  Full name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=""
                  required
                  autoComplete="name"
                  className="border-foreground rounded-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="email">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  required
                  autoComplete="email"
                  className="border-foreground rounded-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  required
                  autoComplete="new-password"
                  className="border-foreground rounded-sm"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-foreground text-background font-semibold hover:bg-foreground/90"
                disabled={isLoading}
              >
                {isLoading ? 'Sending code…' : 'Continue'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-foreground">
                  We&apos;ve sent a 6-digit code to <span className="font-semibold">{pendingEmail || email}</span>.
                </p>
                <p className="text-sm text-muted-foreground">
                  Enter it below to verify your email and create your account.
                </p>
                {devOtp && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Dev only: code is <span className="font-mono font-semibold">{devOtp}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="otp">
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
                  placeholder=""
                  required
                  className="border-foreground rounded-sm text-center text-lg tracking-widest"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-foreground text-background font-semibold hover:bg-foreground/90"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying…' : 'Verify & create account'}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="relative text-center text-xs text-muted-foreground">
            <span className="bg-background px-2 relative z-10">
              or
            </span>
            <div className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" aria-hidden="true" />
          </div>

          {/* Social buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center h-10 font-semibold"
              onClick={loginWithGoogle}
            >
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center h-10 font-semibold"
              onClick={loginWithGithub}
            >
              Continue with GitHub
            </Button>
          </div>

          {/* Legal text */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            By continuing, you agree to the{" "}
            <a href="#" className="underline hover:no-underline">Terms of Service</a>
            , {" "}
            <a href="#" className="underline hover:no-underline">Privacy Policy</a>
            {" "}and{" "}
            <a href="#" className="underline hover:no-underline">Cookie Policy</a>
            .
          </p>

          {/* Sign in link */}
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold underline hover:no-underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
