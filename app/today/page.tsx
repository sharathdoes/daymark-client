'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import NavStrip from '@/components/nav-strip'

interface Article {
  id: number
  source: string
  category: string
  headline: string
  summary: string
  readTime: string
}

const DEMO_ARTICLES: Article[] = [
  {
    id: 1,
    source: 'BBC News',
    category: 'Politics',
    headline: 'Parliament approves sweeping economic reforms after three-day debate',
    summary: 'MPs voted 312 to 289 in favour of the Economic Reform Bill, introducing new capital requirements for high-street banks and a regulatory framework for digital assets. The legislation is expected to come into force by the third quarter.',
    readTime: '4 min',
  },
  {
    id: 2,
    source: 'The Guardian',
    category: 'Climate',
    headline: 'Arctic sea ice reaches record low for April, scientists warn',
    summary: 'Satellite measurements show Arctic sea ice extent at its lowest recorded level for this time of year, 18% below the 1981–2010 average. Researchers say the trend accelerates projections for ice-free Arctic summers.',
    readTime: '3 min',
  },
  {
    id: 3,
    source: 'Reuters',
    category: 'Business',
    headline: 'Central bank holds rates steady as inflation edges toward target',
    summary: "The Monetary Policy Committee voted 7–2 to maintain the base rate at 4.5%, citing progress toward the 2% inflation target. Two members dissented in favour of a 25 basis-point cut.",
    readTime: '3 min',
  },
  {
    id: 4,
    source: 'The Verge',
    category: 'Technology',
    headline: 'Major semiconductor firm announces breakthrough in 2nm chip design',
    summary: 'The company unveiled a fabrication process that improves energy efficiency by 35% over the previous generation while maintaining performance gains. Mass production is targeted for late next year.',
    readTime: '5 min',
  },
  {
    id: 5,
    source: 'Al Jazeera',
    category: 'World',
    headline: 'UN Security Council adopts resolution on ceasefire monitoring',
    summary: 'The council passed a resolution 13–0, with two abstentions, establishing an independent monitoring mission of 200 unarmed observers to be deployed within 30 days.',
    readTime: '4 min',
  },
  {
    id: 6,
    source: 'NPR',
    category: 'Science',
    headline: 'NASA confirms water ice in permanently shadowed craters near lunar south pole',
    summary: 'Data from the Lunar Reconnaissance Orbiter confirms water ice deposits in craters that have not seen sunlight in billions of years. Scientists estimate the reserves could support sustained human presence on the Moon.',
    readTime: '3 min',
  },
  {
    id: 7,
    source: 'AP',
    category: 'Health',
    headline: 'WHO warns of rising antimicrobial resistance in hospital settings globally',
    summary: 'A new WHO report identifies drug-resistant infections as a leading cause of preventable hospital deaths. The agency is calling for stricter antibiotic stewardship programmes and accelerated vaccine development.',
    readTime: '4 min',
  },
  {
    id: 8,
    source: 'Ars Technica',
    category: 'Technology',
    headline: 'Open-source LLM achieves parity with proprietary models on key benchmarks',
    summary: 'Researchers released a 70-billion parameter model trained on publicly available datasets that matches commercial counterparts on coding and reasoning tasks. Model weights and training code are freely available.',
    readTime: '6 min',
  },
]

const ARTICLE_CATEGORIES = Array.from(new Set(DEMO_ARTICLES.map(a => a.category)))

export default function TodayPage() {
  const [filter, setFilter] = useState<string | null>(null)

  const articles = filter
    ? DEMO_ARTICLES.filter(a => a.category === filter)
    : DEMO_ARTICLES

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavStrip active="today" />

      <div className="max-w-3xl mx-auto px-5 md:px-8 py-8">

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={`font-mono text-[10px] tracking-[0.16em] px-3 py-1 border transition-all duration-100 ${
              filter === null
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
            }`}
          >
            ALL
          </button>
          {ARTICLE_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(filter === cat ? null : cat)}
              className={`font-mono text-[10px] tracking-[0.16em] px-3 py-1 border transition-all duration-100 ${
                filter === cat
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Article list */}
        <div>
          {articles.map((article, i) => (
            <div key={article.id} className={`py-6 ${i > 0 ? 'border-t border-border' : ''}`}>
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
                    {article.source.toUpperCase()}
                  </span>
                  <span className="text-border text-[9px]">·</span>
                  <span className="font-mono text-[9px] tracking-[0.2em] text-primary">
                    {article.category.toUpperCase()}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-muted-foreground/60 shrink-0">
                  {article.readTime}
                </span>
              </div>

              <h2 className="font-display text-lg md:text-xl leading-snug text-foreground mb-2">
                {article.headline}
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {article.summary}
              </p>

              <Link
                href="/quiz"
                className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.16em] text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink size={10} />
                QUIZ ON THIS TOPIC
              </Link>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 mt-2">
          <p className="font-mono text-[9px] tracking-wide text-muted-foreground/50">
            Summaries generated from RSS feeds scraped daily.{' '}
            <Link href="/about" className="hover:text-muted-foreground transition-colors underline underline-offset-4">
              How it works →
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
