'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useQuiz, useAuth } from '@/lib/store'
import { saveQuizResult } from '@/lib/api'
import { Check, Link as LinkIcon } from 'lucide-react'

const LETTER_LABELS = ['A', 'B', 'C', 'D']

function getLabel(percentage: number): string {
  if (percentage === 100) return 'PERFECT SCORE'
  if (percentage >= 80) return 'EXCELLENT WORK'
  if (percentage >= 67) return 'GREAT WORK'
  if (percentage >= 34) return 'GOOD EFFORT'
  return 'KEEP READING'
}

function getSubtext(percentage: number): string {
  if (percentage === 100) return 'Every answer correct. Flawless.'
  if (percentage >= 80) return 'You\'re well-informed.'
  if (percentage >= 67) return 'You followed the news today.'
  if (percentage >= 34) return 'Worth a second read.'
  return 'The headlines are waiting.'
}

export default function ResultsContent() {
  const router = useRouter()
  const { session, resetSession } = useQuiz()
  const { isAuthenticated } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const savedRef = useRef(false)

  const score = session?.score ?? 0
  const total = session?.quiz?.questions?.length ?? 0
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  const label = getLabel(percentage)
  const subtext = getSubtext(percentage)

  useEffect(() => {
    if (session?.completed && isAuthenticated && !savedRef.current) {
      savedRef.current = true
      setIsSaving(true)
      const categoryIdsStr = session.quiz.category_ids.join(',')
      saveQuizResult({
        quiz_id: session.quiz.id,
        score: session.score,
        total_questions: session.quiz.questions.length,
        difficulty: session.quiz.difficulty,
        categories: categoryIdsStr,
      })
      .catch(err => console.error("Failed to save quiz result:", err))
      .finally(() => setIsSaving(false))
    }
  }, [session, isAuthenticated])

  const [copied, setCopied] = useState(false)

  if (!session || !session.completed) return null

  const handleTryAgain = () => {
    resetSession()
    const categoryIds = session.quiz.category_ids.join(',')
    router.push(`/?categories=${categoryIds}&difficulty=${session.quiz.difficulty}`)
  }

  const handleNewQuiz = () => {
    resetSession()
    router.push('/')
  }

  const handleShare = () => {
    const url = `${window.location.origin}/quiz/${session.quiz.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  }).toUpperCase()

  return (
    <div className="space-y-8">

      {/* Masthead */}
      <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
        <div className="border-t-2 border-foreground pt-4 mb-1">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">FINAL EDITION · {today}</span>
            <span className="font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
              {session.quiz.difficulty} · {total} QUESTIONS
            </span>
          </div>

          {/* Score — editorial headline */}
          <div className="text-center py-8 border border-border">
            <div className="font-display text-7xl md:text-8xl text-foreground mb-3 tracking-tight">
              {score}<span className="text-muted-foreground/40 text-5xl md:text-6xl"> / {total}</span>
            </div>
            <div className="font-mono text-xs tracking-[0.25em] text-primary mb-1">{label}</div>
            <div className="font-mono text-[11px] text-muted-foreground">{subtext}</div>

            {/* Percentage bar */}
            <div className="mt-5 mx-auto max-w-xs">
              <div className="h-px bg-border overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 font-mono text-[10px] text-muted-foreground">
                <span>0%</span>
                <span className="text-primary">{percentage}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="animate-slide-up flex flex-wrap gap-2" style={{ animationDelay: '100ms' }}>
        <button
          type="button"
          onClick={handleTryAgain}
          className="font-mono text-[11px] tracking-[0.14em] px-4 py-2.5 border border-primary bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          RETRY SAME SETTINGS
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="font-mono text-[11px] tracking-[0.14em] px-4 py-2.5 border border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors flex items-center gap-2"
        >
          {copied ? <Check className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
          {copied ? 'COPIED' : 'SHARE QUIZ'}
        </button>
        <button
          type="button"
          onClick={handleNewQuiz}
          className="font-mono text-[11px] tracking-[0.14em] px-4 py-2.5 border border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
        >
          NEW QUIZ
        </button>
      </div>

      {/* Review */}
      <section className="animate-slide-up space-y-4" style={{ animationDelay: '180ms' }}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">REVIEW</span>
          <div className="flex-1 h-px bg-border" />
          <span className="font-mono text-[10px] text-muted-foreground tracking-wide">CORRECT IN GREEN</span>
        </div>

        <div className="space-y-3">
          {session.quiz.questions.map((question, qIndex) => {
            const userAnswer = session.answers[qIndex]
            const isCorrect = userAnswer === question.answer

            return (
              <div key={qIndex} className="border border-border">
                <div className={`flex items-center gap-3 px-4 py-2.5 border-b border-border ${isCorrect ? 'bg-emerald-500/5' : 'bg-destructive/5'}`}>
                  <span className={`font-mono text-[11px] font-semibold ${isCorrect ? 'text-emerald-500' : 'text-destructive'}`}>
                    {String(qIndex + 1).padStart(2, '0')}
                  </span>
                  <span className={`font-mono text-[10px] tracking-[0.18em] ${isCorrect ? 'text-emerald-500' : 'text-destructive'}`}>
                    {isCorrect ? '✓ CORRECT' : '✗ INCORRECT'}
                  </span>
                </div>
                <div className="px-4 py-3">
                  <p className="text-sm text-foreground leading-relaxed mb-3">{question.question}</p>
                  <div className="space-y-1">
                    {question.options.map((option, optIndex) => {
                      const isCorrectOption = optIndex === question.answer
                      const isUserSelected = optIndex === userAnswer
                      const isUserWrong = isUserSelected && !isCorrectOption
                      return (
                        <div
                          key={optIndex}
                          className={`flex items-start gap-3 px-3 py-1.5 border text-xs ${
                            isCorrectOption
                              ? 'border-emerald-500/50 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300'
                              : isUserWrong
                                ? 'border-destructive/40 bg-destructive/6 text-destructive'
                                : 'border-transparent text-muted-foreground'
                          }`}
                        >
                          <span className="font-mono font-semibold flex-shrink-0">{LETTER_LABELS[optIndex]}</span>
                          <span>{option}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <span className="font-mono text-[10px] text-muted-foreground">SOURCE  </span>
                    <a
                      href={question.article_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-primary hover:underline underline-offset-4 tracking-wide"
                    >
                      {new URL(question.article_url).hostname}
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
