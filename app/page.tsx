import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      <main className="flex-1 flex items-center justify-center px-5 md:px-8">
        <div className="w-full max-w-md py-16">

          {/* Name + tagline */}
          <div className="mb-10">
            <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4 leading-none">
              Daymark
            </h1>
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground mb-5">
              DAILY NEWS, TESTED DAILY.
            </p>
            <div className="h-px bg-border" />
          </div>

          {/* Feature links */}
          <nav className="space-y-0">
            {[
              {
                href: '/today',
                label: 'TODAY',
                desc: "Summaries of today's coverage across every topic.",
              },
              {
                href: '/quiz',
                label: 'QUIZ',
                desc: 'Test what you actually followed. New questions every day.',
              },
              {
                href: '/subscribe',
                label: 'SUBSCRIBE',
                desc: 'A morning digest from the topics you follow. Free.',
              },
            ].map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start justify-between gap-6 py-5 border-b border-border hover:border-foreground/30 transition-colors"
              >
                <div>
                  <span className="font-mono text-[11px] tracking-[0.2em] text-foreground group-hover:text-primary transition-colors block mb-1">
                    {label}
                  </span>
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground group-hover:text-foreground transition-colors mt-0.5 shrink-0">
                  →
                </span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="mt-10 flex items-center gap-5">
            <Link
              href="/daily"
              className="flex items-center gap-2 font-mono text-[9px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="pulse-amber w-1 h-1 rounded-full bg-primary inline-block" />
              DAILY CHALLENGE
            </Link>
            <span className="text-border text-xs">·</span>
            <Link
              href="/about"
              className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
            >
              ABOUT
            </Link>
            <span className="text-border text-xs">·</span>
            <a
              href="https://github.com/sharathdoes/daymark"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
            >
              GITHUB
            </a>
          </div>

        </div>
      </main>

    </div>
  )
}
