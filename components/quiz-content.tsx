'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { useQuiz } from '@/lib/store'
import { cn } from '@/lib/utils'

const LETTER_LABELS = ['A', 'B', 'C', 'D']

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export default function QuizContent() {
  const router = useRouter()
  const { session, answerQuestion, nextQuestion, decrementTimer } = useQuiz()

  useEffect(() => {
    if (!session || session.timerOption === 'none' || session.completed) return
    if (session.timerSeconds <= 0) {
      router.push('/results')
      return
    }
    const interval = setInterval(() => { decrementTimer() }, 1000)
    return () => clearInterval(interval)
  }, [session?.timerSeconds, session?.timerOption, session?.completed, decrementTimer, router])

  if (!session) return null

  const totalQuestions = session.quiz.questions?.length ?? 0

  if (totalQuestions === 0) {
    return (
      <div className="space-y-6">
        <div className="border-2 border-foreground p-6">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-destructive mb-2">ERROR</p>
          <p className="text-sm">This quiz has no questions. Try generating a new one.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="font-mono text-[11px] tracking-[0.22em] uppercase border-2 border-foreground px-5 py-2.5 hover:bg-foreground hover:text-background transition-colors"
        >
          GO BACK
        </button>
      </div>
    )
  }

  const currentQuestion = session.quiz.questions[session.currentIndex]
  const selectedAnswer = session.answers[session.currentIndex]
  const isAnswered = selectedAnswer !== null
  const isLastQuestion = session.currentIndex === totalQuestions - 1
  const progress = ((session.currentIndex) / totalQuestions) * 100
  const isTimeLow = session.timerOption !== 'none' && session.timerSeconds < 60

  const handleOptionClick = (optionIndex: number) => {
    answerQuestion(session.currentIndex, optionIndex)
  }

  const handleNext = () => {
    if (isAnswered) {
      nextQuestion()
      if (isLastQuestion) {
        setTimeout(() => router.push('/results'), 0)
      }
    }
  }

  return (
    <div className="space-y-0 border-2 border-foreground">

      {/* Header bar */}
      <div className="border-b-2 border-foreground bg-foreground text-background px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.22em]">
          <span>Q.{String(session.currentIndex + 1).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}</span>
          <span className="size-1 rounded-full bg-background/40" />
          <span>{session.quiz.difficulty?.toUpperCase()}</span>
        </div>
        {session.timerOption !== 'none' && (
          <span className={cn(
            'font-mono text-[11px] tracking-[0.2em] tabular-nums',
            isTimeLow ? 'text-red-400 animate-pulse' : 'text-background/80'
          )}>
            {formatTime(session.timerSeconds)}
          </span>
        )}
      </div>

      {/* Progress segments */}
      <div className="border-b-2 border-foreground flex h-1.5">
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 transition-colors duration-300',
              i < totalQuestions - 1 && 'border-r border-foreground/15',
              i < session.currentIndex ? 'bg-foreground' :
              i === session.currentIndex ? 'bg-foreground/50' : 'bg-background'
            )}
            style={{ opacity: i === session.currentIndex ? Math.max(0.5, progress / 100) : undefined }}
          />
        ))}
      </div>

      {/* Question */}
      <div className="px-6 md:px-10 py-8 md:py-12 border-b-2 border-foreground">
        <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground mb-5">QUESTION</p>
        <p className="font-display font-semibold text-2xl md:text-4xl leading-[1.1] tracking-[-0.025em]">
          {currentQuestion.question}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {currentQuestion.options.map((option, index) => {
          const isSelected = index === selectedAnswer
          const isRightCol = index % 2 === 1
          const isBottomRow = index >= 2
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleOptionClick(index)}
              className={cn(
                'flex items-start gap-5 px-5 py-5 md:px-7 md:py-7 text-left transition-all cursor-pointer group',
                !isRightCol && 'md:border-r-2 border-foreground',
                isBottomRow && 'border-t-2 border-foreground',
                index === 1 && 'border-t-2 md:border-t-0 border-foreground',
                isSelected
                  ? 'bg-foreground text-background'
                  : 'hover:bg-muted'
              )}
            >
              <span className={cn(
                'font-display font-bold text-3xl md:text-4xl tracking-[-0.04em] tabular-nums shrink-0 leading-none mt-1 transition-colors',
                isSelected ? 'text-background' : 'text-muted-foreground group-hover:text-foreground'
              )}>
                {LETTER_LABELS[index]}
              </span>
              <span className="flex-1 text-base md:text-lg leading-snug">{option}</span>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-foreground grid grid-cols-12">
        <div className="col-span-7 px-5 py-4 border-r-2 border-foreground flex items-center font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
          {isAnswered ? 'ANSWER LOCKED · CONTINUE' : 'SELECT AN OPTION'}
        </div>
        <button
          type="button"
          onClick={handleNext}
          disabled={!isAnswered}
          className={cn(
            'col-span-5 px-5 py-4 flex items-center justify-between gap-3 transition-colors group',
            isAnswered
              ? 'bg-foreground text-background hover:bg-foreground/85 cursor-pointer'
              : 'bg-muted text-muted-foreground/60 cursor-not-allowed'
          )}
        >
          <span className="font-display font-semibold text-lg md:text-xl tracking-[-0.02em]">
            {isLastQuestion && isAnswered ? 'See results' : isAnswered ? 'Next' : 'Pick an answer'}
          </span>
          <ArrowUpRight className="size-5 group-hover:rotate-12 transition-transform" />
        </button>
      </div>
    </div>
  )
}
