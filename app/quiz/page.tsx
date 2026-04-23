'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useQuiz } from '@/lib/store'
import { getCategories, generateQuiz } from '@/lib/api'
import { Category, QuizSession } from '@/lib/types'
import QuizContent from '@/components/quiz-content'
import LoadingOverlay from '@/components/loading-overlay'
import NavStrip from '@/components/nav-strip'

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
]

const QUESTION_COUNTS = [5, 10, 15]

const TIMER_OPTIONS = [
  { id: 'none', label: 'No timer' },
  { id: '5', label: '5 min' },
  { id: '10', label: '10 min' },
]

export default function QuizPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { session, setSession } = useQuiz()

  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [timerOption, setTimerOption] = useState<string>('none')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getCategories()
        setCategories(data)

        const categoriesParam = searchParams.get('categories')
        const difficultyParam = searchParams.get('difficulty')
        const countParam = searchParams.get('count')
        const timerParam = searchParams.get('timer')

        if (categoriesParam) {
          setSelectedCategoryIds(categoriesParam.split(',').map(Number))
          if (difficultyParam) setSelectedDifficulty(difficultyParam)
          if (countParam) setQuestionCount(Number(countParam))
          if (timerParam) setTimerOption(timerParam)
        } else {
          try {
            const pending = localStorage.getItem('pendingQuiz')
            if (pending) {
              const p = JSON.parse(pending)
              if (p.categories?.length) setSelectedCategoryIds(p.categories)
              if (p.difficulty) setSelectedDifficulty(p.difficulty)
              if (p.count) setQuestionCount(p.count)
              if (p.timer) setTimerOption(p.timer)
            }
          } catch { /* ignore */ }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setCategoriesLoading(false)
      }
    }
    load()
  }, [searchParams])

  const toggleCategory = (id: number) =>
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    )

  const canStart = selectedCategoryIds.length > 0 && selectedDifficulty !== null

  const handleStart = async () => {
    if (!canStart) {
      setError('Select at least one section and a difficulty level.')
      return
    }
    if (!isAuthenticated) {
      const params = new URLSearchParams()
      params.set('categories', selectedCategoryIds.join(','))
      if (selectedDifficulty) params.set('difficulty', selectedDifficulty)
      params.set('count', String(questionCount))
      params.set('timer', timerOption)
      localStorage.setItem('pendingQuiz', JSON.stringify({
        categories: selectedCategoryIds,
        difficulty: selectedDifficulty,
        count: questionCount,
        timer: timerOption,
      }))
      router.push(`/login?${params.toString()}`)
      return
    }
    setIsGenerating(true)
    setError('')
    try {
      const quiz = await generateQuiz({
        category_ids: selectedCategoryIds,
        difficulty: selectedDifficulty!,
        number_of_questions: questionCount,
      })
      const newSession: QuizSession = {
        quiz,
        currentIndex: 0,
        answers: Array(quiz.questions.length).fill(null),
        score: 0,
        completed: false,
        timerOption,
        timerSeconds: timerOption === 'none' ? 0 : parseInt(timerOption, 10) * 60,
      }
      setSession(newSession)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz')
    } finally {
      setIsGenerating(false)
    }
  }

  // Quiz in progress — show the quiz content
  if (session && !session.completed) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {isGenerating && <LoadingOverlay />}
        <NavStrip active="quiz" />
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-8">
          <QuizContent />
        </div>
      </div>
    )
  }

  // Builder
  return (
    <div className="min-h-screen bg-background text-foreground">
      {isGenerating && <LoadingOverlay />}
      <NavStrip active="quiz" />

      <div className="max-w-3xl mx-auto px-5 md:px-8 py-8">

        {error && (
          <div className="mb-6 border-l-2 border-destructive bg-destructive/5 px-4 py-2.5 font-mono text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-7">

          {/* Sections — in a box */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground mb-2">
              SECTIONS
            </p>
            <div className="border border-border p-3">
              {categoriesLoading ? (
                <span className="font-mono text-[10px] text-muted-foreground animate-pulse">Loading…</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => {
                    const sel = selectedCategoryIds.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`font-mono text-[10px] tracking-[0.14em] px-3 py-1 border transition-all duration-100 ${
                          sel
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                        }`}
                      >
                        {cat.name.toUpperCase()}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-6">
            <span className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground w-24 shrink-0">
              DIFFICULTY
            </span>
            <div className="flex gap-1.5">
              {DIFFICULTIES.map((d) => {
                const sel = selectedDifficulty === d.id
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(d.id)}
                    className={`font-mono text-[10px] tracking-[0.14em] px-3 py-1 border transition-all duration-100 ${
                      sel
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                    }`}
                  >
                    {d.label.toUpperCase()}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Questions */}
          <div className="flex items-center gap-6">
            <span className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground w-24 shrink-0">
              QUESTIONS
            </span>
            <div className="flex gap-1.5">
              {QUESTION_COUNTS.map((count) => {
                const sel = questionCount === count
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`font-mono text-[10px] tracking-[0.14em] px-3 py-1 border transition-all duration-100 ${
                      sel
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                    }`}
                  >
                    {count}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-6">
            <span className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground w-24 shrink-0">
              TIMER
            </span>
            <div className="flex gap-1.5">
              {TIMER_OPTIONS.map((opt) => {
                const sel = timerOption === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTimerOption(opt.id)}
                    className={`font-mono text-[10px] tracking-[0.14em] px-3 py-1 border transition-all duration-100 ${
                      sel
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                    }`}
                  >
                    {opt.label.toUpperCase()}
                  </button>
                )
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2 flex items-center gap-5 border-t border-border">
            <button
              type="button"
              onClick={handleStart}
              disabled={!canStart || isGenerating}
              className={`mt-5 font-mono text-[11px] tracking-[0.2em] px-8 py-3 border transition-all duration-150 ${
                canStart && !isGenerating
                  ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border-border text-muted-foreground/40 cursor-not-allowed'
              }`}
            >
              {isGenerating ? 'GENERATING...' : 'BEGIN →'}
            </button>

            {canStart && (
              <span className="mt-5 font-mono text-[10px] text-muted-foreground">
                {selectedCategoryIds.length} section{selectedCategoryIds.length > 1 ? 's' : ''}
                {' '}· {selectedDifficulty} · {questionCount} q
              </span>
            )}
          </div>

          {!isAuthenticated && (
            <p className="font-mono text-[9px] text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline underline-offset-4">Sign in</Link>
              {' '}to save streaks and review past results.
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
