"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useAuth, useQuiz } from '@/lib/store'
import { signUp, verifyEmailSignUp, loginWithGoogle, loginWithGithub, generateQuiz } from '@/lib/api'
import type { QuizSession } from '@/lib/types'
import { BlurFade } from '@/components/ui/blur-fade'
import { cn } from '@/lib/utils'

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
      setError(err instanceof Error ? err.message : 'Failed to verify email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5 py-10">
      <BlurFade inView className="w-full max-w-sm">
        <header className="border-y-2 border-foreground py-3">
          <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground text-center">NEW SUBSCRIBER</div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.03em] leading-none text-center mt-1.5">
            {step === 'form' ? 'Sign up.' : 'Verify.'}
          </h1>
        </header>

        {error && (
          <div className="border-b-2 border-destructive py-2 px-3 font-mono text-[11px] tracking-[0.16em] text-destructive">
            {error}
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="border-b-2 border-foreground">
            <label htmlFor="name" className="block border-b-2 border-foreground px-4 py-3">
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground block mb-1.5">NAME</span>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Taylor"
                required
                autoComplete="name"
                className="w-full bg-transparent border-0 outline-none font-display text-lg tracking-[-0.02em] placeholder:text-muted-foreground/40"
              />
            </label>
            <label htmlFor="email" className="block border-b-2 border-foreground px-4 py-3">
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground block mb-1.5">EMAIL</span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full bg-transparent border-0 outline-none font-display text-lg tracking-[-0.02em] placeholder:text-muted-foreground/40"
              />
            </label>
            <label htmlFor="password" className="block border-b-2 border-foreground px-4 py-3">
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground block mb-1.5">PASSWORD</span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="w-full bg-transparent border-0 outline-none font-display text-lg tracking-[-0.02em] placeholder:text-muted-foreground/40"
              />
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full px-4 py-3 flex items-center justify-between gap-3 transition-colors group',
                isLoading ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-foreground text-background hover:bg-foreground/85'
              )}
            >
              <span className="font-display font-bold text-lg tracking-[-0.02em]">
                {isLoading ? 'Sending code…' : 'Create account'}
              </span>
              <ArrowUpRight className="size-5 group-hover:rotate-12 transition-transform" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="border-b-2 border-foreground">
            <div className="px-4 py-3 border-b-2 border-foreground">
              <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
                CODE SENT TO <span className="text-foreground">{(pendingEmail || email).toUpperCase()}</span>
              </p>
              {devOtp && (
                <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground mt-1">
                  DEV: <span className="text-foreground">{devOtp}</span>
                </p>
              )}
            </div>
            <label htmlFor="otp" className="block border-b-2 border-foreground px-4 py-3">
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground block mb-1.5">VERIFICATION CODE</span>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                className="w-full bg-transparent border-0 outline-none font-display text-2xl tracking-[0.16em] tabular-nums placeholder:text-muted-foreground/40"
              />
            </label>
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full px-4 py-3 flex items-center justify-between gap-3 transition-colors group',
                isLoading ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-foreground text-background hover:bg-foreground/85'
              )}
            >
              <span className="font-display font-bold text-lg tracking-[-0.02em]">
                {isLoading ? 'Verifying…' : 'Verify & continue'}
              </span>
              <ArrowUpRight className="size-5 group-hover:rotate-12 transition-transform" />
            </button>
          </form>
        )}

        <div className="border-b-2 border-foreground grid grid-cols-2">
          <button type="button" onClick={loginWithGoogle} className="px-3 py-3 font-mono text-[10px] tracking-[0.2em] hover:bg-muted transition-colors border-r-2 border-foreground">
            GOOGLE
          </button>
          <button type="button" onClick={loginWithGithub} className="px-3 py-3 font-mono text-[10px] tracking-[0.2em] hover:bg-muted transition-colors">
            GITHUB
          </button>
        </div>

        <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground text-center py-3">
          ALREADY A SUBSCRIBER?{' '}
          <Link href="/login" className="text-foreground hover:opacity-80 underline underline-offset-4">
            SIGN IN
          </Link>
        </p>
      </BlurFade>
    </div>
  )
}
