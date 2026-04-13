'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useQuiz } from '@/lib/store'
import { getCategories, generateQuiz } from '@/lib/api'
import { Category, QuizSession } from '@/lib/types'
import LoadingOverlay from '@/components/loading-overlay'

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', description: 'Perfect for warming up' },
  { id: 'medium', label: 'Medium', description: 'Test your knowledge' },
  { id: 'hard', label: 'Hard', description: 'Challenge yourself' },
]

const QUESTION_COUNTS = [5, 10, 15]

const TIMER_OPTIONS = [
  { id: 'none', label: 'No timer' },
  { id: '5', label: '5 min' },
  { id: '10', label: '10 min' },
]

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const { setSession } = useQuiz()

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [timerOption, setTimerOption] = useState<string>('none')
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
        
        // Restore from URL params (results page retry) or localStorage (back from sign-in)
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
          // No URL params — check localStorage saved before sign-in redirect
          try {
            const pending = localStorage.getItem('pendingQuiz')
            if (pending) {
              const p = JSON.parse(pending)
              if (p.categories?.length) setSelectedCategoryIds(p.categories)
              if (p.difficulty) setSelectedDifficulty(p.difficulty)
              if (p.count) setQuestionCount(p.count)
              if (p.timer) setTimerOption(p.timer)
            }
          } catch { /* ignore parse errors */ }
        }
      } catch (err) {
        setError('Failed to load categories')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [searchParams])

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    )
  }

  const canStart = selectedCategoryIds.length > 0 && selectedDifficulty !== null

  const handleStart = async () => {
    if (!canStart) {
      setError('Please select at least one category and a difficulty level')
      return
    }

    if (!isAuthenticated) {
      const params = new URLSearchParams()
      params.set('categories', selectedCategoryIds.join(','))
      if (selectedDifficulty) params.set('difficulty', selectedDifficulty)
      params.set('count', String(questionCount))
      params.set('timer', timerOption)

      // Persist in localStorage so OAuth redirects don't lose the selection
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

      const session: QuizSession = {
        quiz,
        currentIndex: 0,
        answers: Array(quiz.questions.length).fill(null),
        score: 0,
        completed: false,
        timerOption: timerOption,
        timerSeconds: timerOption === 'none' ? 0 : parseInt(timerOption, 10) * 60,
      }

      setSession(session)
      router.push('/quiz')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).toUpperCase()

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {isGenerating && <LoadingOverlay />}

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">

          {/* Masthead */}
          <section className="animate-slide-up mb-10" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">{today}</span>
              <Link
                href="/daily"
                className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-primary border border-primary/30 px-3 py-1 hover:bg-primary/5 transition-colors"
              >
                <span className="pulse-amber w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                DAILY CHALLENGE
              </Link>
            </div>

            <div className="border-t border-foreground/60 pt-5 mb-4">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.08] text-foreground mb-4">
                You read the news today?<br />
                <span className="text-primary italic">Let&apos;s see.</span>
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed border-l-2 border-border pl-4">
              Every question is pulled from a real article published today.
              No trivia, no recycled facts — just today&apos;s headlines and how well you followed them.
            </p>
          </section>

          {error && (
            <div className="mb-6 animate-slide-up border-l-2 border-destructive bg-destructive/5 px-4 py-3 font-mono text-xs text-destructive">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="py-16 font-mono text-xs text-muted-foreground tracking-widest animate-pulse">
              LOADING CATEGORIES...
            </div>
          ) : (
            <div className="space-y-8">

              {/* Topics */}
              <section className="animate-slide-up" style={{ animationDelay: '80ms' }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">SELECT TOPICS</span>
                  <div className="flex-1 h-px bg-border" />
                  {selectedCategoryIds.length > 0 && (
                    <span className="font-mono text-[10px] text-primary tracking-wide">
                      {selectedCategoryIds.length} SELECTED
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const selected = selectedCategoryIds.includes(category.id)
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className={`font-mono text-[11px] tracking-[0.14em] px-3 py-1.5 border transition-all duration-150 ${
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                        }`}
                      >
                        {category.name.toUpperCase()}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Controls row */}
              <section className="animate-slide-up" style={{ animationDelay: '160ms' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-border p-5">

                  {/* Difficulty */}
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground mb-3">DIFFICULTY</p>
                    <div className="flex flex-col gap-1.5">
                      {DIFFICULTIES.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setSelectedDifficulty(d.id)}
                          className={`flex items-center gap-2.5 px-3 py-2 border text-left transition-all duration-150 ${
                            selectedDifficulty === d.id
                              ? 'border-primary bg-primary/8 text-foreground'
                              : 'border-border hover:border-foreground/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            selectedDifficulty === d.id ? 'bg-primary' : 'bg-border'
                          }`} />
                          <div>
                            <div className="font-mono text-[11px] tracking-wide">{d.label.toUpperCase()}</div>
                            <div className="text-[10px] text-muted-foreground">{d.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Questions */}
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground mb-3">QUESTIONS</p>
                    <div className="flex flex-col gap-1.5">
                      {QUESTION_COUNTS.map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setQuestionCount(count)}
                          className={`flex items-center gap-2.5 px-3 py-2 border text-left transition-all duration-150 ${
                            questionCount === count
                              ? 'border-primary bg-primary/8 text-foreground'
                              : 'border-border hover:border-foreground/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            questionCount === count ? 'bg-primary' : 'bg-border'
                          }`} />
                          <span className="font-mono text-[11px] tracking-wide">{count} QUESTIONS</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timer */}
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground mb-3">TIMER</p>
                    <div className="flex flex-col gap-1.5">
                      {TIMER_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setTimerOption(option.id)}
                          className={`flex items-center gap-2.5 px-3 py-2 border text-left transition-all duration-150 ${
                            timerOption === option.id
                              ? 'border-primary bg-primary/8 text-foreground'
                              : 'border-border hover:border-foreground/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            timerOption === option.id ? 'bg-primary' : 'bg-border'
                          }`} />
                          <span className="font-mono text-[11px] tracking-wide">{option.label.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* CTA */}
              <section className="animate-slide-up border-t border-border pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ animationDelay: '240ms' }}>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {selectedCategoryIds.length === 0
                    ? 'SELECT TOPICS + DIFFICULTY TO BEGIN'
                    : `READY — ${selectedDifficulty?.toUpperCase() ?? 'NO DIFFICULTY'} · ${selectedCategoryIds.length} TOPIC${selectedCategoryIds.length > 1 ? 'S' : ''} · ${questionCount} Q`}
                </p>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={!canStart || isGenerating}
                  className={`font-mono text-[11px] tracking-[0.18em] px-6 py-3 border transition-all duration-150 ${
                    canStart && !isGenerating
                      ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border-border text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? 'GENERATING...' : 'START QUIZ →'}
                </button>
              </section>

              {!isAuthenticated && (
                <p className="animate-slide-up font-mono text-[10px] text-muted-foreground" style={{ animationDelay: '300ms' }}>
                  <Link href="/login" className="text-primary hover:underline underline-offset-4">SIGN IN</Link>
                  {' '}to save streaks and track past quizzes.
                </p>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  )
}
