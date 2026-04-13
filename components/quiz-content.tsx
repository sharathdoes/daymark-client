'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuiz } from '@/lib/store'

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
        <div className="border border-border p-6">
          <p className="font-mono text-xs tracking-widest text-muted-foreground mb-2">ERROR</p>
          <p className="text-sm text-foreground">This quiz has no questions. Please try generating a new one.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="font-mono text-[11px] tracking-[0.18em] border border-border px-5 py-2.5 text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
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
    <div className="space-y-6">

      {/* Progress header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
            Q{String(session.currentIndex + 1).padStart(2, '0')} / {String(totalQuestions).padStart(2, '0')}
          </span>
          {session.timerOption !== 'none' && (
            <span className={`font-mono text-[11px] tracking-widest ${isTimeLow ? 'text-destructive pulse-amber' : 'text-muted-foreground'}`}>
              {formatTime(session.timerSeconds)}
            </span>
          )}
        </div>
        {/* Progress bar */}
        <div className="h-px bg-border w-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Segment markers */}
        <div className="flex mt-1 gap-px">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-0.5 transition-colors duration-300 ${
                i < session.currentIndex ? 'bg-primary/40' :
                i === session.currentIndex ? 'bg-primary' : 'bg-border/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="border border-border">
        <div className="border-b border-border px-5 py-3 flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">QUESTION</span>
          <span className="font-mono text-[10px] text-primary tracking-widest">
            {session.quiz.difficulty?.toUpperCase()}
          </span>
        </div>
        <div className="px-5 py-5">
          <p className="text-base md:text-lg leading-relaxed text-foreground font-medium">
            {currentQuestion.question}
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-1.5">
        {currentQuestion.options.map((option, index) => {
          const isSelected = index === selectedAnswer
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleOptionClick(index)}
              className={`flex w-full items-start gap-4 border px-4 py-3.5 text-left transition-all duration-100 cursor-pointer group ${
                isSelected
                  ? 'border-primary bg-primary/6 text-foreground'
                  : 'border-border hover:border-foreground/30 bg-background'
              }`}
            >
              <span className={`font-mono text-[11px] font-semibold tracking-widest flex-shrink-0 mt-0.5 transition-colors ${
                isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground/60'
              }`}>
                {LETTER_LABELS[index]}
              </span>
              <span className="flex-1 text-sm leading-relaxed">
                {option}
              </span>
              {isSelected && (
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
              )}
            </button>
          )
        })}
      </div>

      {/* Next */}
      <div className="flex justify-end pt-2 border-t border-border">
        <button
          type="button"
          onClick={handleNext}
          disabled={!isAnswered}
          className={`font-mono text-[11px] tracking-[0.18em] px-6 py-3 border transition-all duration-150 ${
            isAnswered
              ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
              : 'border-border text-muted-foreground cursor-not-allowed opacity-50'
          }`}
        >
          {isLastQuestion && isAnswered ? 'SEE RESULTS →' : isAnswered ? 'NEXT →' : 'SELECT AN ANSWER'}
        </button>
      </div>
    </div>
  )
}
