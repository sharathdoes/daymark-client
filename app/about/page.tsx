import Link from 'next/link'

export const metadata = {
  title: 'About — Daymark',
  description: 'Daymark is a daily news quiz drawn entirely from articles published today.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4">

          {/* Masthead bar */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">ABOUT DAYMARK</span>
            <Link
              href="/daily"
              className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-primary hover:opacity-80 transition-opacity"
            >
              <span className="pulse-amber w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              DAILY CHALLENGE
            </Link>
          </div>

          {/* 2-column editorial body */}
          <div className="flex flex-col md:flex-row">

            {/* Col 1 — Editorial content */}
            <div className="flex-[6] border-b md:border-b-0 md:border-r border-border py-8 md:pr-10">

              <h1 className="font-display text-4xl md:text-5xl leading-[1.06] text-foreground mb-6">
                Built for people who<br />
                <span className="text-primary italic">actually read the news.</span>
              </h1>

              <div className="space-y-8">

                <div>
                  <p className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground pb-2 mb-4 border-b border-border">
                    WHAT IT IS
                  </p>
                  <div className="space-y-3 text-sm text-foreground leading-relaxed">
                    <p>
                      Most news quiz tools rely on pre-written question banks assembled days or weeks
                      in advance. Daymark doesn&apos;t. Each question is generated live from an article
                      published on the day you play — meaning the quiz you take this morning
                      will not exist tomorrow.
                    </p>
                    <p>
                      Choose your topics, set a difficulty, and receive a quiz built entirely from
                      that day&apos;s coverage. It tests recall, not trivia.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground pb-2 mb-4 border-b border-border">
                    WHY IT EXISTS
                  </p>
                  <div className="space-y-3 text-sm text-foreground leading-relaxed">
                    <p>
                      Reading the news every day is easy to maintain as a habit but hard to
                      hold yourself accountable to. Did you actually absorb what you read,
                      or did you just scroll past it?
                    </p>
                    <p>
                      Daymark gives that accountability a form. It takes five minutes,
                      it&apos;s different every day, and it tells you honestly how closely
                      you were paying attention.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground pb-2 mb-4 border-b border-border">
                    DAILY CHALLENGE
                  </p>
                  <div className="border border-border p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="pulse-amber w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                      <span className="font-mono text-[9px] tracking-[0.18em] text-primary">LIVE EACH MORNING</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      Every morning at 06:00 IST, a single challenge is issued for all players.
                      One set of questions. One leaderboard. A fresh start every day.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sign in to record your score, track your streak, and see how you compare.
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground pb-2 mb-4 border-b border-border">
                    THE PROJECT
                  </p>
                  <div className="space-y-2 text-sm leading-relaxed">
                    <p className="text-foreground">
                      Daymark is an independent open-source project by{' '}
                      <a
                        href="https://github.com/sharathdoes"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline underline-offset-4"
                      >
                        Sharath Gaddam
                      </a>
                      .
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Contributions and bug reports are welcome on{' '}
                      <a
                        href="https://github.com/sharathdoes/daymark"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline underline-offset-4"
                      >
                        GitHub
                      </a>
                      .
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Col 2 — Technical pipeline */}
            <div className="flex-[4] py-8 md:pl-8">

              <div className="space-y-8">

                <div>
                  <p className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground pb-2 mb-4 border-b border-border">
                    HOW ARTICLES ARE SOURCED
                  </p>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <span className="font-mono text-[10px] tracking-[0.16em] text-primary mt-0.5 shrink-0">RSS</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        We monitor RSS feeds from major publishers — BBC News, The Guardian,
                        Reuters, Associated Press, and others — across every supported category.
                        Feeds refresh continuously throughout the day.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-mono text-[10px] tracking-[0.16em] text-primary mt-0.5 shrink-0">SCRAPE</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        When a new item appears in a feed, the full article is fetched and scraped.
                        We extract the body text, headline, publication timestamp, and source attribution.
                        Paywalled content is skipped.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-mono text-[10px] tracking-[0.16em] text-primary mt-0.5 shrink-0">INDEX</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Articles are indexed by category and date. Only content published within the
                        current calendar day qualifies for that day&apos;s quiz pool.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground pb-2 mb-4 border-b border-border">
                    HOW QUESTIONS ARE GENERATED
                  </p>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <span className="font-mono text-[10px] tracking-[0.16em] text-primary mt-0.5 shrink-0">LLM</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Scraped article text is passed to a language model with strict prompting:
                        generate factual, unambiguous multiple-choice questions tied directly
                        to the article content. No inference, no opinion — only what the article states.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-mono text-[10px] tracking-[0.16em] text-primary mt-0.5 shrink-0">CACHE</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Generated questions are cached and linked back to their source article.
                        When you finish a quiz, each question links to the original story.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="font-mono text-[10px] tracking-[0.16em] text-primary mt-0.5 shrink-0">EXPIRE</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Questions expire with the day. Yesterday&apos;s articles do not carry
                        forward into today&apos;s pool, keeping the quiz current.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-mono text-[9px] tracking-[0.24em] text-muted-foreground pb-2 mb-4 border-b border-border">
                    SOURCES
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {[
                      'BBC News', 'The Guardian', 'Reuters', 'Associated Press',
                      'Al Jazeera', 'NPR', 'The Verge', 'Ars Technica',
                    ].map((source) => (
                      <span key={source} className="font-mono text-[9px] tracking-wide text-muted-foreground">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Footer CTA strip */}
          <div className="border-t border-border py-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link
              href="/"
              className="font-mono text-[11px] tracking-[0.18em] px-6 py-2.5 border border-primary bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150"
            >
              START TODAY&apos;S QUIZ →
            </Link>
            <Link
              href="/daily"
              className="font-mono text-[11px] tracking-[0.14em] px-6 py-2.5 border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-all duration-150"
            >
              DAILY CHALLENGE
            </Link>
            <a
              href="https://github.com/sharathdoes/daymark"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-[0.14em] px-6 py-2.5 border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-all duration-150"
            >
              GITHUB
            </a>
          </div>

        </div>
      </main>
    </div>
  )
}
