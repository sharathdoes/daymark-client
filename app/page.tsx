'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth, useQuiz } from '@/lib/store'
import { getCategories, generateQuiz } from '@/lib/api'
import { Category, QuizSession } from '@/lib/types'
import Header from '@/components/header'
import LoadingOverlay from '@/components/loading-overlay'
import { Button } from '@/components/ui/button'

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
        
        // Check for query params from results page
        const categoriesParam = searchParams.get('categories')
        const difficultyParam = searchParams.get('difficulty')
        
        if (categoriesParam) {
          const ids = categoriesParam.split(',').map(Number)
          setSelectedCategoryIds(ids)
        }
        if (difficultyParam) {
          setSelectedDifficulty(difficultyParam)
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

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col bg-background text-foreground">
      {isGenerating && <LoadingOverlay />}

      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl px-4 py-12">
          {error && (
            <div className="mb-8 rounded-sm border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <p className="text-sm text-muted-foreground">
                Loading categories…
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Hero Section */}
              <div className="text-center space-y-6">
                {/* Grid Icon */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-foreground rounded">
                    <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
                      {/* 3x3 grid */}
                      <rect x="10" y="10" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
                      <rect x="30" y="10" width="15" height="15" fill="#c8b458" stroke="currentColor" strokeWidth="2" />
                      <rect x="50" y="10" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
                      
                      <rect x="10" y="30" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
                      <rect x="30" y="30" width="15" height="15" fill="#6ca965" stroke="currentColor" strokeWidth="2" />
                      <rect x="50" y="30" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
                      
                      <rect x="10" y="50" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
                      <rect x="30" y="50" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" />
                      <rect x="50" y="50" width="15" height="15" fill="#6ca965" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
                  Daymark
                </h1>

                <p className="text-lg md:text-xl font-serif text-foreground max-w-md mx-auto">
                  Get 6 chances to guess
                  <br />
                  a 5-letter word.
                </p>
              </div>

              {/* Quiz Configuration */}
              <div className="space-y-8 border-t border-border pt-10">
                {/* Categories */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Select categories</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const selected = selectedCategoryIds.includes(category.id);
                      return (
                        <Button
                          key={category.id}
                          type="button"
                          variant={selected ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleCategory(category.id)}
                          className="text-xs"
                        >
                          {category.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Number of Questions */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Number of questions</p>
                  <div className="flex gap-2">
                    {QUESTION_COUNTS.map((count) => (
                      <Button
                        key={count}
                        type="button"
                        size="sm"
                        variant={questionCount === count ? "default" : "outline"}
                        onClick={() => setQuestionCount(count)}
                        className="text-xs"
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Timer */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Timer</p>
                  <div className="flex gap-2">
                    {TIMER_OPTIONS.map((option) => (
                      <Button
                        key={option.id}
                        type="button"
                        size="sm"
                        variant={timerOption === option.id ? "default" : "outline"}
                        onClick={() => setTimerOption(option.id)}
                        className="text-xs"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Difficulty</p>
                  <div className="space-y-2">
                    {DIFFICULTIES.map((difficulty) => {
                      const active = selectedDifficulty === difficulty.id;
                      return (
                        <button
                          key={difficulty.id}
                          type="button"
                          onClick={() => setSelectedDifficulty(difficulty.id)}
                          className={`w-full rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
                            active
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-background hover:bg-muted"
                          }`}
                        >
                          <div className="font-semibold text-sm">{difficulty.label}</div>
                          <p className="text-xs opacity-70">{difficulty.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center space-y-4 border-t border-border pt-10">
                <Button
                  type="button"
                  onClick={handleStart}
                  disabled={!canStart || isGenerating}
                  className="w-full h-11 bg-foreground text-background font-semibold hover:bg-foreground/90"
                >
                  {isGenerating ? "Preparing your quiz…" : "Play"}
                </Button>

                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground">
                    <Link href="/login" className="font-semibold underline hover:no-underline">
                      Sign in
                    </Link>
                    {" "}to save your streaks and past quizzes.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="text-center space-y-1 text-xs text-muted-foreground border-t border-border pt-10">
                <p>Today&apos;s Daymark</p>
                <p className="font-semibold text-foreground">No. 1</p>
                <p className="text-xs">News Quiz</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
