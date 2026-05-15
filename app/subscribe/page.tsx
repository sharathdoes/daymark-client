'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import NavStrip from '@/components/nav-strip'
import { BlurFade } from '@/components/ui/blur-fade'
import { getCategories, subscribe } from '@/lib/api'
import { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function SubscribePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<number[]>([])
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setCategoriesLoading(false))
  }, [])

  const toggleTopic = (id: number) =>
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubscribing(true)
    setError('')
    try {
      await subscribe({ email, category_ids: selectedTopics })
      setSubscribed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavStrip active="subscribe" />

      <main className="px-5 md:px-10 py-6">
        <div className="mx-auto w-full max-w-5xl">

          <BlurFade delay={0.05} inView>
            <header className="border-y-2 border-foreground py-4 flex items-end justify-between flex-wrap gap-3">
              <div className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">DELIVERED 07:00 LOCAL</div>
              <h1 className="font-display font-extrabold text-5xl md:text-7xl tracking-[-0.04em] leading-[0.9] w-full md:w-auto text-center mt-1">
                Morning digest.
              </h1>
              <div className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">FREE · NO TRACKING</div>
            </header>
          </BlurFade>

          {subscribed ? (
            <BlurFade delay={0.15} inView>
              <section className="grid md:grid-cols-12 gap-0 border-b-2 border-foreground">
                <div className="md:col-span-12 bg-foreground text-background p-8 md:p-14 flex flex-col items-start gap-6">
                  <Check className="size-10" strokeWidth={2.5} />
                  <h2 className="font-display font-bold text-5xl md:text-7xl tracking-[-0.04em] leading-[0.95]">
                    You're in.
                  </h2>
                  <p className="text-base text-background/70 max-w-md leading-relaxed">
                    Check your inbox tomorrow morning. First digest goes out at <span className="font-mono">07:00</span>. Unsubscribe is one click — no questions asked.
                  </p>
                </div>
              </section>
            </BlurFade>
          ) : (
            <>
              {/* PITCH */}
              <BlurFade delay={0.15} inView>
                <section className="grid md:grid-cols-12 gap-0 border-b-2 border-foreground">
                  <div className="md:col-span-7 p-6 md:p-10 md:border-r-2 border-foreground">
                    <p className="font-mono text-[10px] tracking-[0.22em] bg-foreground text-background px-2 py-1 inline-block mb-6">
                      WHAT YOU GET
                    </p>
                    <h2 className="font-display font-bold leading-[0.95] tracking-[-0.035em] text-[clamp(2rem,4vw,3.5rem)] mb-5">
                      One email a day.<br />
                      <span className="text-muted-foreground">Your sections.</span><br />
                      Summarized.
                    </h2>
                    <p className="text-base text-muted-foreground leading-relaxed max-w-prose">
                      No newsletter spam, no aggregator bloat. Just the same 30-second summaries we use to generate quiz questions, sent to your inbox before coffee.
                    </p>
                  </div>
                  <div className="md:col-span-5 flex flex-col">
                    {[
                      { num: '01', label: 'PICK YOUR SECTIONS' },
                      { num: '02', label: 'WE WATCH THE FEEDS' },
                      { num: '03', label: 'SUMMARY ARRIVES 07:00' },
                    ].map((step, i) => (
                      <div
                        key={step.num}
                        className={cn(
                          'flex items-baseline gap-4 px-6 py-5 flex-1',
                          i < 2 && 'border-b-2 border-foreground'
                        )}
                      >
                        <span className="font-display font-bold text-3xl tracking-[-0.03em] text-muted-foreground tabular-nums">{step.num}</span>
                        <span className="font-mono text-[11px] tracking-[0.22em]">{step.label}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </BlurFade>

              {error && (
                <div className="border-b-2 border-destructive py-3 px-1 font-mono text-[11px] tracking-[0.18em] text-destructive">
                  {error}
                </div>
              )}

              {/* FORM */}
              <BlurFade delay={0.3} inView>
                <form onSubmit={handleSubmit} className="border-b-2 border-foreground">

                  {/* Topics */}
                  <section className="py-7 md:py-9 px-1">
                    <div className="flex items-baseline justify-between mb-5">
                      <h3 className="font-display font-bold text-3xl md:text-4xl tracking-[-0.03em]">
                        <span className="text-muted-foreground">01.</span> Topics
                      </h3>
                      <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
                        {selectedTopics.length === 0 ? 'ALL TOPICS' : `${selectedTopics.length} SELECTED`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {categoriesLoading ? (
                        <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground animate-pulse">LOADING…</span>
                      ) : (
                        categories.map((cat) => {
                          const sel = selectedTopics.includes(cat.id)
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => toggleTopic(cat.id)}
                              className={cn(
                                'font-mono text-[11px] tracking-[0.18em] uppercase px-3 py-2 border-2 transition-all',
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
                    <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground mt-4">
                      LEAVE BLANK TO RECEIVE EVERY TOPIC.
                    </p>
                  </section>

                  {/* Email + Submit */}
                  <section className="grid md:grid-cols-12 gap-0 border-t-2 border-foreground">
                    <label htmlFor="email" className="md:col-span-7 p-6 md:p-8 md:border-r-2 border-foreground">
                      <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground block mb-3">
                        02. YOUR EMAIL
                      </span>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-transparent border-0 border-b-2 border-foreground/20 focus:border-foreground outline-none font-display text-2xl md:text-3xl tracking-[-0.025em] placeholder:text-muted-foreground/40 py-2"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={subscribing || !email}
                      className={cn(
                        'md:col-span-5 p-6 md:p-8 flex items-center justify-between gap-4 transition-colors group',
                        email && !subscribing
                          ? 'bg-foreground text-background hover:bg-foreground/85 cursor-pointer'
                          : 'bg-muted text-muted-foreground/60 cursor-not-allowed'
                      )}
                    >
                      <span className="font-display font-bold text-3xl md:text-4xl tracking-[-0.03em] text-left">
                        {subscribing ? 'Sending…' : 'Subscribe'}
                      </span>
                      <ArrowUpRight className="size-7 md:size-8 group-hover:rotate-12 transition-transform shrink-0" />
                    </button>
                  </section>
                </form>
              </BlurFade>
            </>
          )}

          <BlurFade delay={0.6} inView>
            <footer className="py-5 flex items-center justify-between flex-wrap gap-3">
              <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
                ONE EMAIL · ONE CLICK TO UNSUBSCRIBE
              </p>
              <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
                DAYMARK · MORNING EDITION
              </p>
            </footer>
          </BlurFade>

        </div>
      </main>
    </div>
  )
}
