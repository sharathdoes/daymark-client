'use client'

import { useEffect, useState } from 'react'
import NavStrip from '@/components/nav-strip'
import { getCategories } from '@/lib/api'
import { Category } from '@/lib/types'

export default function SubscribePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<number[]>([])
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

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

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!email) return
    setSubscribing(true)
    await new Promise(r => setTimeout(r, 800))
    setSubscribed(true)
    setSubscribing(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavStrip active="subscribe" />

      <div className="min-h-[calc(100vh-53px)] flex pt-16 justify-center px-5 md:px-8 ">
        <div className="w-full max-w-md">

          {subscribed ? (
            <div>
              <h2 className="font-display text-4xl text-foreground mb-3">You&apos;re in.</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Check your inbox tomorrow morning. First digest goes out at 07:00.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="font-display text-3xl text-foreground mb-3">
                  A morning digest,<br />for topics you actually follow.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  I built this for myself. If you want a daily email with summaries
                  from the sections you care about — it&apos;s free, no tracking,
                  unsubscribe any time.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                <div className="flex">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="flex-1 border border-border bg-transparent font-mono text-[13px] px-4 py-2.5 focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/40 min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={subscribing || !email}
                    className={`border border-l-0 font-mono text-[11px] tracking-[0.2em] px-5 py-2.5 shrink-0 transition-all duration-150 ${
                      email && !subscribing
                        ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border-border text-muted-foreground/40 cursor-not-allowed'
                    }`}
                  >
                    {subscribing ? '...' : 'SUBSCRIBE →'}
                  </button>
                </div>

                <div>
                  <p className="font-mono text-[9px] tracking-[0.22em] text-muted-foreground mb-2">
                    TOPICS — pick what goes in your digest
                  </p>
                  <div className="border border-border p-3">
                    {categoriesLoading ? (
                      <span className="font-mono text-[10px] text-muted-foreground animate-pulse">Loading…</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {categories.map((cat) => {
                          const sel = selectedTopics.includes(cat.id)
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => toggleTopic(cat.id)}
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
                  <p className="font-mono text-[9px] text-muted-foreground/50 mt-2">
                    Leave blank to receive all topics.
                  </p>
                </div>

              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
