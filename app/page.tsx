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
    <div className="min-h-[calc(100vh-56px)] flex flex-col bg-gradient-to-br from-background via-purple-50/20 to-pink-50/20 text-foreground overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full -mr-48 -mt-48 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-pink-200/20 to-transparent rounded-full -ml-40 -mb-40 blur-3xl" />

      {isGenerating && <LoadingOverlay />}

      <main className="flex-1 relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-16">
          {error && (
            <div className="mb-8 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive font-medium">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <p className="text-sm text-muted-foreground">Loading categories…</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-16 items-start">
              {/* Hero Section - Left */}
              <div className="space-y-10 flex flex-col justify-center pt-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-primary uppercase tracking-widest">Daily News Quiz</p>
                    <h1 className="text-6xl md:text-7xl font-serif font-bold leading-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                      Daymark
                    </h1>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-md font-light">
                    Test your knowledge of today&apos;s biggest stories. Six questions pulled straight from real news articles. How well were you paying attention?
                  </p>
                </div>

                {!isAuthenticated && (
                  <div>
                    <Link href="/login">
                      <Button size="lg" className="shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all">
                        Sign in to track progress
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Quiz Configuration - Right */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-border/60 p-10 shadow-xl space-y-8 sticky top-24 hover:shadow-2xl transition-shadow duration-300">
                {/* Categories */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-foreground">Categories</label>
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
                        >
                          {category.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Number of Questions */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-foreground">Questions</label>
                  <div className="flex gap-2">
                    {QUESTION_COUNTS.map((count) => (
                      <Button
                        key={count}
                        type="button"
                        size="sm"
                        variant={questionCount === count ? "default" : "outline"}
                        onClick={() => setQuestionCount(count)}
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Timer */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-foreground">Timer</label>
                  <div className="flex gap-2">
                    {TIMER_OPTIONS.map((option) => (
                      <Button
                        key={option.id}
                        type="button"
                        size="sm"
                        variant={timerOption === option.id ? "default" : "outline"}
                        onClick={() => setTimerOption(option.id)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-foreground">Difficulty</label>
                  <div className="space-y-2.5">
                    {DIFFICULTIES.map((difficulty) => {
                      const active = selectedDifficulty === difficulty.id;
                      return (
                        <button
                          key={difficulty.id}
                          type="button"
                          onClick={() => setSelectedDifficulty(difficulty.id)}
                          className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
                            active
                              ? "border-primary bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-md"
                              : "border-border/50 bg-background/50 hover:border-primary/30 hover:bg-background"
                          }`}
                        >
                          <div className="font-bold text-base">{difficulty.label}</div>
                          <p className={`text-xs mt-1.5 ${active ? 'text-primary/70' : 'text-muted-foreground'}`}>{difficulty.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  type="button"
                  onClick={handleStart}
                  disabled={!canStart || isGenerating}
                  size="lg"
                  className="w-full"
                >
                  {isGenerating ? "Preparing your quiz…" : "Start Quiz"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
