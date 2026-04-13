'use client'

import { useEffect, useState } from 'react'

const STEPS = [
  { prefix: 'FETCH', text: 'Pulling articles from 24+ RSS feeds...' },
  { prefix: 'READ ', text: 'Analyzing today\'s headlines...' },
  { prefix: 'GEN  ', text: 'Generating quiz questions with AI...' },
  { prefix: 'BUILD', text: 'Assembling your quiz...' },
  { prefix: 'READY', text: 'Almost there...' },
]

export default function LoadingOverlay() {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(8)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep(prev => Math.min(prev + 1, STEPS.length - 1))
    }, 1800)

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 12, 94))
    }, 400)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'oklch(0.06 0.003 85)' }}>

      {/* Amber top border */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />

      <div className="w-full max-w-sm px-6 font-mono">
        {/* Wordmark */}
        <div className="mb-10 flex items-center gap-3">
          <span className="w-0.5 h-6 bg-primary block" />
          <span className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">DAYMARK</span>
        </div>

        {/* Log lines */}
        <div className="space-y-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className={`flex items-start gap-3 text-[11px] transition-opacity duration-300 ${
              i <= step ? 'opacity-100' : 'opacity-20'
            }`}>
              <span className={`tracking-widest ${i === step ? 'text-primary' : 'text-muted-foreground'}`}>
                {s.prefix}
              </span>
              <span className={i < step ? 'text-muted-foreground' : 'text-foreground'}>
                {s.text}
                {i === step && <span className="cursor-blink ml-0.5 text-primary">▌</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-px bg-border w-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground tracking-widest">
            <span>PROCESSING</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
