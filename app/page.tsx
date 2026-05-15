import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { BlurFade } from '@/components/ui/blur-fade'
import { Marquee } from '@/components/ui/marquee'
import { NumberTicker } from '@/components/ui/number-ticker'

const SOURCES = ['REUTERS', 'AP', 'BBC', 'BLOOMBERG', 'THE ATLANTIC', 'NYT', 'WSJ', 'GUARDIAN', 'FT', 'WIRED', 'THE VERGE', 'AXIOS']

const editionDate = new Date()
const editionDay = editionDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
const editionFull = editionDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
const editionNum = Math.floor((editionDate.getTime() - new Date('2024-01-01').getTime()) / 86400000)

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="px-5 md:px-10 py-6 md:py-10">
        <div className="mx-auto w-full max-w-6xl">

          {/* MASTHEAD */}
          <BlurFade delay={0.05} inView>
            <header className="border-y-2 border-foreground py-4">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
                  <span>{editionDay}</span>
                  <span className="size-1 rounded-full bg-foreground/30" />
                  <span>{editionFull}</span>
                </div>
                <div className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground flex items-center gap-3">
                  <span>EDITION №{String(editionNum).padStart(4, '0')}</span>
                  <span className="size-1 rounded-full bg-foreground/30" />
                  <span className="flex items-center gap-1.5">
                    <span className="pulse-soft size-1.5 rounded-full bg-red-600" />
                    LIVE
                  </span>
                </div>
              </div>
              <h1 className="font-display font-extrabold tracking-[-0.06em] leading-[0.85] text-center text-[clamp(4rem,17vw,12rem)] mt-3 mb-1">
                Daymark
              </h1>
              <p className="text-center font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
                The daily news quiz · est. 2024
              </p>
            </header>
          </BlurFade>

          {/* TICKER STRIP */}
          <BlurFade delay={0.2} inView>
            <div className="border-b-2 border-foreground py-2.5 overflow-hidden">
              <Marquee className="[--duration:38s] [--gap:3rem]" pauseOnHover>
                {SOURCES.map((s) => (
                  <span key={s} className="font-mono text-[11px] tracking-[0.22em] text-foreground/70 inline-flex items-center gap-3">
                    {s}
                    <span className="size-1 rounded-full bg-foreground/30" />
                  </span>
                ))}
              </Marquee>
            </div>
          </BlurFade>

          {/* HERO GRID */}
          <div className="grid md:grid-cols-12 gap-0 border-b-2 border-foreground">

            {/* Lead — quiz CTA */}
            <BlurFade delay={0.35} inView className="md:col-span-8 border-r-0 md:border-r-2 border-foreground p-6 md:p-10 flex flex-col justify-between min-h-[420px]">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="font-mono text-[10px] tracking-[0.22em] bg-foreground text-background px-2 py-1">TODAY'S QUIZ</span>
                  <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">10 QUESTIONS · 5 MIN</span>
                </div>
                <h2 className="font-display font-bold leading-[0.95] tracking-[-0.04em] text-[clamp(2.5rem,6vw,5rem)]">
                  How well did you<br />
                  read the news<br />
                  this morning?
                </h2>
              </div>
              <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                  Every question is pulled from a real article published in the last 24&nbsp;hours. No trivia. No filler. Just the day.
                </p>
                <Link
                  href="/quiz"
                  className="group inline-flex items-center gap-3 bg-foreground text-background font-semibold tracking-tight text-base px-6 py-3.5 hover:bg-foreground/85 transition-colors"
                >
                  Start today's quiz
                  <ArrowUpRight className="size-4 group-hover:rotate-12 transition-transform" />
                </Link>
              </div>
            </BlurFade>

            {/* Side — stat callouts */}
            <BlurFade delay={0.55} inView className="md:col-span-4 flex flex-col">
              <div className="border-b-2 border-foreground px-6 py-6 md:py-8">
                <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground mb-1">QUESTIONS PUBLISHED</p>
                <p className="font-display font-bold text-5xl md:text-6xl tracking-[-0.04em] tabular-nums">
                  <NumberTicker value={editionNum * 10} className="text-foreground" />
                </p>
              </div>
              <div className="border-b-2 border-foreground px-6 py-6 md:py-8">
                <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground mb-1">ARTICLES SUMMARIZED</p>
                <p className="font-display font-bold text-5xl md:text-6xl tracking-[-0.04em] tabular-nums">
                  <NumberTicker value={editionNum * 24} className="text-foreground" />
                </p>
              </div>
              <div className="px-6 py-6 md:py-8 flex-1">
                <p className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground mb-1">READERS QUIZZED</p>
                <p className="font-display font-bold text-5xl md:text-6xl tracking-[-0.04em] tabular-nums">
                  <NumberTicker value={editionNum * 47} className="text-foreground" />
                </p>
              </div>
            </BlurFade>
          </div>

          {/* SECTIONS — three columns like a newspaper folio */}
          <div className="grid md:grid-cols-3 gap-0 border-b-2 border-foreground">
            {[
              {
                num: 'I',
                href: '/today',
                label: "Today's read",
                desc: "Bite-sized summaries of every story breaking in the last 24 hours, sorted by section.",
                meta: 'UPDATED HOURLY',
              },
              {
                num: 'II',
                href: '/quiz',
                label: 'Build a quiz',
                desc: 'Pick the sections you follow, choose difficulty, race the clock. Or don\'t.',
                meta: 'YOUR TOPICS',
              },
              {
                num: 'III',
                href: '/subscribe',
                label: 'Morning digest',
                desc: 'One email at 07:00. Your sections, summarized. Free, no tracking, no fluff.',
                meta: 'EMAIL · 07:00',
              },
            ].map(({ num, href, label, desc, meta }, i) => (
              <BlurFade key={href} delay={0.7 + i * 0.1} inView>
                <Link
                  href={href}
                  className={`group block px-6 py-7 md:py-9 h-full transition-colors hover:bg-muted ${
                    i < 2 ? 'md:border-r-2 border-foreground' : ''
                  } ${i > 0 ? 'border-t-2 md:border-t-0 border-foreground' : ''}`}
                >
                  <div className="flex items-baseline justify-between mb-5">
                    <span className="font-display font-bold text-2xl tracking-tight text-muted-foreground">{num}.</span>
                    <span className="font-mono text-[9px] tracking-[0.22em] text-muted-foreground">{meta}</span>
                  </div>
                  <h3 className="font-display font-semibold text-3xl md:text-4xl tracking-[-0.03em] leading-[1] mb-3">
                    {label}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-foreground group-hover:gap-2 transition-all">
                    OPEN <ArrowUpRight className="size-3" />
                  </span>
                </Link>
              </BlurFade>
            ))}
          </div>

          {/* COLOPHON / FOOTER */}
          <BlurFade delay={1.05} inView>
            <footer className="py-6 flex flex-wrap items-center justify-between gap-4">
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                © DAYMARK · ALL EDITIONS ARCHIVED
              </p>
              <div className="flex items-center gap-5">
                <Link href="/daily" className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <span className="pulse-soft size-1.5 rounded-full bg-red-600" />
                  DAILY CHALLENGE
                </Link>
                <Link href="/about" className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
                  ABOUT
                </Link>
                <a
                  href="https://github.com/sharathdoes/daymark"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  GITHUB
                </a>
              </div>
            </footer>
          </BlurFade>

        </div>
      </main>
    </div>
  )
}
