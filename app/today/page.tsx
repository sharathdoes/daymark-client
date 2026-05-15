'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ExternalLink, ArrowUpRight } from 'lucide-react'
import NavStrip from '@/components/nav-strip'
import { BlurFade } from '@/components/ui/blur-fade'
import { getTodayArticles } from '@/lib/api'
import { Article } from '@/lib/types'
import { cn } from '@/lib/utils'

const today = new Date()
const todayLong = today.toLocaleDateString('en-US', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
}).toUpperCase()

export default function TodayPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    getTodayArticles()
      .then(setArticles)
      .catch(() => setError("Could not load today's articles."))
      .finally(() => setLoading(false))
  }, [])

  const categories = Array.from(new Set(articles.map(a => a.category)))
  const filtered = filter ? articles.filter(a => a.category === filter) : articles
  const lead = filtered[0]
  const rest = filtered.slice(1)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavStrip active="today" />

      <main className="px-5 md:px-10 py-6">
        <div className="mx-auto w-full max-w-6xl">

          {/* Section masthead */}
          <BlurFade delay={0.05} inView>
            <header className="border-y-2 border-foreground py-4 flex items-end justify-between flex-wrap gap-3">
              <div className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">{todayLong}</div>
              <h1 className="font-display font-extrabold text-5xl md:text-7xl tracking-[-0.04em] leading-[0.9] order-1 md:order-none w-full md:w-auto text-center mt-1">
                Today's Read.
              </h1>
              <div className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
                {articles.length} STORIES
              </div>
            </header>
          </BlurFade>

          {/* Filter strip */}
          {!loading && !error && categories.length > 0 && (
            <BlurFade delay={0.2} inView>
              <div className="border-b-2 border-foreground py-3 flex items-center gap-1 overflow-x-auto">
                <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground shrink-0 pr-3 border-r border-border mr-2">
                  SECTIONS
                </span>
                <button
                  type="button"
                  onClick={() => setFilter(null)}
                  className={cn(
                    'shrink-0 font-mono text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 transition-colors',
                    filter === null ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilter(filter === cat ? null : cat)}
                    className={cn(
                      'shrink-0 font-mono text-[10px] tracking-[0.18em] uppercase px-2.5 py-1 transition-colors',
                      filter === cat ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </BlurFade>
          )}

          {loading && (
            <div className="py-32 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
              Loading edition…
            </div>
          )}

          {error && (
            <div className="py-24 text-center font-mono text-[11px] tracking-[0.22em] text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="py-24 text-center">
              <h3 className="font-display text-3xl font-semibold mb-2">No stories yet.</h3>
              <p className="text-sm text-muted-foreground">Check back later — feeds run on a schedule.</p>
            </div>
          )}

          {/* LEAD STORY */}
          {!loading && !error && lead && (
            <BlurFade delay={0.3} inView>
              <article className="grid md:grid-cols-12 gap-0 border-b-2 border-foreground group">
                <div className="md:col-span-7 p-6 md:p-10 md:border-r-2 border-foreground">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="font-mono text-[10px] tracking-[0.22em] bg-foreground text-background px-2 py-1">
                      LEAD STORY
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
                      {lead.category?.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="font-display font-bold leading-[0.95] tracking-[-0.035em] text-[clamp(2rem,4.5vw,3.75rem)] mb-6">
                    {lead.headline}
                  </h2>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-prose mb-6">
                    {lead.summary}
                  </p>
                  <div className="flex items-center gap-5 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
                    <span>{lead.source?.toUpperCase()}</span>
                    <span>·</span>
                    <span>{lead.readTime} MIN READ</span>
                    {lead.url && (
                      <>
                        <span>·</span>
                        <a href={lead.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors">
                          ORIGINAL <ExternalLink className="size-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <Link
                  href="/quiz"
                  className="md:col-span-5 bg-foreground text-background p-6 md:p-10 flex flex-col justify-between hover:bg-foreground/90 transition-colors group min-h-[200px]"
                >
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.22em] text-background/70 mb-4">QUIZ HOOK</p>
                    <p className="font-display font-semibold text-2xl md:text-3xl leading-[1.05] tracking-[-0.02em]">
                      Could you answer 3 questions about this story without re-reading it?
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] mt-6 group-hover:gap-3 transition-all">
                    TAKE THE QUIZ <ArrowUpRight className="size-3" />
                  </span>
                </Link>
              </article>
            </BlurFade>
          )}

          {/* REST — magazine column flow */}
          {!loading && !error && rest.length > 0 && (
            <div className="grid md:grid-cols-3 gap-0 border-b-2 border-foreground">
              {rest.map((article, i) => (
                <BlurFade key={article.id} delay={0.4 + i * 0.05} inView>
                  <article
                    className={cn(
                      'group h-full p-6 md:p-7 flex flex-col',
                      (i % 3) !== 2 && 'md:border-r-2 border-foreground',
                      i >= 3 && 'border-t-2 border-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-mono text-[10px] tracking-[0.2em] text-foreground border border-foreground/30 px-1.5 py-0.5">
                        {article.category?.toUpperCase()}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
                        №{String(i + 2).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-2xl leading-[1.05] tracking-[-0.025em] mb-3 group-hover:text-foreground/80 transition-colors">
                      {article.headline}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
                      {article.summary}
                    </p>
                    <div className="pt-4 border-t border-border flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
                      <span>{article.source?.toUpperCase()} · {article.readTime}M</span>
                      <div className="flex items-center gap-3">
                        {article.url && (
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                        <Link href="/quiz" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                          QUIZ <ArrowUpRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </BlurFade>
              ))}
            </div>
          )}

          {/* COLOPHON */}
          <BlurFade delay={0.9} inView>
            <footer className="py-6 flex items-center justify-between flex-wrap gap-3">
              <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground">
                ARTICLES SUMMARIZED FROM RSS · UPDATED HOURLY
              </p>
              <Link href="/about" className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2">
                HOW IT WORKS <ArrowUpRight className="size-3" />
              </Link>
            </footer>
          </BlurFade>

        </div>
      </main>
    </div>
  )
}
