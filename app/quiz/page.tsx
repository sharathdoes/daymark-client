'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useAuth, useQuiz } from '@/lib/store'
import { getCategories, generateQuiz } from '@/lib/api'
import { Category, QuizSession } from '@/lib/types'
import QuizContent from '@/components/quiz-content'
import LoadingOverlay from '@/components/loading-overlay'
import NavStrip from '@/components/nav-strip'
import { BlurFade } from '@/components/ui/blur-fade'
import { cn } from '@/lib/utils'

const DIFFICULTIES = [
  { id: 'easy', label: 'EASY', hint: '5-second pace' },
  { id: 'medium', label: 'MEDIUM', hint: 'careful read' },
  { id: 'hard', label: 'HARD', hint: 'edge cases' },
]

const QUESTION_COUNTS = [5, 10, 15]

const TIMER_OPTIONS = [
  { id: 'none', label: 'NO TIMER' },
  { id: '5', label: '5 MIN' },
  { id: '10', label: '10 MIN' },
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
      setError('Select at least one section and a difficulty.')
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

  if (session && !session.completed) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {isGenerating && <LoadingOverlay />}
        <NavStrip active="quiz" />
        <div className="flex-1 flex items-center px-5 md:px-10 py-8">
          <div className="mx-auto w-full max-w-3xl">
            <QuizContent />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {isGenerating && <LoadingOverlay />}
      <NavStrip active="quiz" />

      <main className="flex-1 flex items-center px-5 md:px-10 py-6">
        <div className="mx-auto w-full max-w-5xl">

          {/* Masthead */}
          <BlurFade delay={0.05} inView>
            <header className="border-y-2 border-foreground py-3 flex items-center justify-between flex-wrap gap-2">
              <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">SET UP YOUR EDITION</div>
              <h1 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.03em] leading-none">
                Build a quiz.
              </h1>
              <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                STEP 1 / 4
              </div>
            </header>
          </BlurFade>

          {error && (
            <div className="border-b-2 border-destructive py-3 px-1 font-mono text-[11px] tracking-[0.18em] text-destructive">
              {error}
            </div>
          )}

          {/* SECTIONS */}
          <BlurFade delay={0.15} inView>
            <section className="border-b-2 border-foreground py-5 md:py-6 px-1">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="font-display font-bold text-xl md:text-2xl tracking-[-0.02em]">
                  <span className="text-muted-foreground">01.</span> Pick your sections
                </h2>
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                  {selectedCategoryIds.length} SELECTED
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categoriesLoading ? (
                  <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground animate-pulse">LOADING…</span>
                ) : (
                  categories.map((cat) => {
                    const sel = selectedCategoryIds.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={cn(
                          'font-mono text-[10px] tracking-[0.16em] uppercase px-2.5 py-1.5 border-2 transition-all',
                          sel
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-foreground/20 text-muted-foreground hover:border-foreground hover:text-foreground'
                        )}
                      >
                        {cat.name}
                      </button>
                    )
                  })
                )}
              </div>
            </section>
          </BlurFade>

          {/* DIFFICULTY + COUNT + TIMER — 3 cols */}
          <div className="grid md:grid-cols-3 gap-0 border-b-2 border-foreground">

            <BlurFade delay={0.25} inView className="md:border-r-2 border-foreground p-4 md:p-5">
              <h2 className="font-display font-bold text-lg md:text-xl tracking-[-0.02em] mb-0.5">
                <span className="text-muted-foreground">02.</span> Difficulty
              </h2>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground mb-3">HOW HARD?</p>
              <div className="space-y-1">
                {DIFFICULTIES.map((d) => {
                  const sel = selectedDifficulty === d.id
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDifficulty(d.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-2 border-2 transition-all text-left',
                        sel
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-foreground/20 hover:border-foreground'
                      )}
                    >
                      <span className="font-mono text-[10px] tracking-[0.18em] font-medium">{d.label}</span>
                      <span className={cn('font-mono text-[9px] tracking-[0.14em]', sel ? 'text-background/70' : 'text-muted-foreground')}>
                        {d.hint}
                      </span>
                    </button>
                  )
                })}
              </div>
            </BlurFade>

            <BlurFade delay={0.35} inView className="md:border-r-2 border-foreground p-4 md:p-5 border-t-2 md:border-t-0 border-foreground">
              <h2 className="font-display font-bold text-lg md:text-xl tracking-[-0.02em] mb-0.5">
                <span className="text-muted-foreground">03.</span> Questions
              </h2>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground mb-3">HOW MANY?</p>
              <div className="grid grid-cols-3 gap-1">
                {QUESTION_COUNTS.map((count) => {
                  const sel = questionCount === count
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={cn(
                        'py-3.5 border-2 transition-all text-center',
                        sel
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-foreground/20 hover:border-foreground'
                      )}
                    >
                      <p className="font-display font-bold text-xl tracking-[-0.02em] tabular-nums">{count}</p>
                    </button>
                  )
                })}
              </div>
            </BlurFade>

            <BlurFade delay={0.45} inView className="p-4 md:p-5 border-t-2 md:border-t-0 border-foreground">
              <h2 className="font-display font-bold text-lg md:text-xl tracking-[-0.02em] mb-0.5">
                <span className="text-muted-foreground">04.</span> Timer
              </h2>
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground mb-3">RACE THE CLOCK?</p>
              <div className="space-y-1">
                {TIMER_OPTIONS.map((opt) => {
                  const sel = timerOption === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTimerOption(opt.id)}
                      className={cn(
                        'w-full px-2.5 py-2 border-2 transition-all text-left',
                        sel
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-foreground/20 hover:border-foreground'
                      )}
                    >
                      <span className="font-mono text-[10px] tracking-[0.18em] font-medium">{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </BlurFade>
          </div>

          {/* START BAR */}
          <BlurFade delay={0.55} inView>
            <section className="grid md:grid-cols-12 gap-0 border-b-2 border-foreground">
              <div className="md:col-span-7 p-4 md:p-5 md:border-r-2 border-foreground flex flex-col justify-center">
                <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground mb-1.5">YOUR EDITION</p>
                <p className="font-display font-semibold text-lg md:text-xl tracking-[-0.02em] leading-snug">
                  {selectedCategoryIds.length > 0 ? `${selectedCategoryIds.length} section${selectedCategoryIds.length > 1 ? 's' : ''}` : 'Pick at least one section'}
                  {selectedDifficulty && <span className="text-muted-foreground">, {selectedDifficulty}</span>}
                  <span className="text-muted-foreground">, {questionCount} questions</span>
                  {timerOption !== 'none' && <span className="text-muted-foreground">, {timerOption}-min timer</span>}
                  .
                </p>
              </div>
              <button
                type="button"
                onClick={handleStart}
                disabled={!canStart || isGenerating}
                className={cn(
                  'md:col-span-5 p-4 md:p-5 flex items-center justify-between gap-3 transition-colors group',
                  canStart && !isGenerating
                    ? 'bg-foreground text-background hover:bg-foreground/85 cursor-pointer'
                    : 'bg-muted text-muted-foreground/60 cursor-not-allowed'
                )}
              >
                <span className="font-display font-bold text-xl md:text-2xl tracking-[-0.02em] text-left">
                  {isGenerating ? 'Generating…' : 'Begin quiz'}
                </span>
                <ArrowUpRight className="size-5 md:size-6 group-hover:rotate-12 transition-transform shrink-0" />
              </button>
            </section>
          </BlurFade>

          <BlurFade delay={0.7} inView>
            <footer className="py-3 flex items-center justify-between flex-wrap gap-2">
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                NEW QUESTIONS GENERATED EVERY RUN
              </p>
              {!isAuthenticated && (
                <Link href="/login" className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                  SIGN IN TO SAVE STREAKS <ArrowUpRight className="size-3" />
                </Link>
              )}
            </footer>
          </BlurFade>

        </div>
      </main>
    </div>
  )
}
