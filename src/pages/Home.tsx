import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Eye, Mail, Palette, Plug } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    quote: 'ProposalAI turned our vague briefs into signed SOWs in one afternoon.',
    name: 'Maya Chen',
    role: 'Designer',
  },
  {
    quote: 'Win rate up, follow-ups down — the score feedback is eerily accurate.',
    name: 'Jordan Ellis',
    role: 'Agency Lead',
  },
  {
    quote: 'Clients actually read the proposal because it speaks their language.',
    name: 'Sam Rivera',
    role: 'Consultant',
  },
  {
    quote: 'The public link + signature flow feels premium without the legal headache.',
    name: 'Priya N.',
    role: 'Product Studio',
  },
  {
    quote: 'We replaced a 6-page Word template chaos with one Smart Mode pass.',
    name: 'Leo Park',
    role: 'Developer',
  },
]

const faqs = [
  { q: 'What does this tool actually do?', a: 'It generates high-converting proposals tailored to your client, helping you stand out and close deals faster.' },
  { q: 'Can I customize the output to my needs?', a: 'Yes. You can adjust tone, structure, and key points to match your style and the client’s requirements.' },
  { q: 'Will this actually help me get more clients or sales?', a: 'It improves your chances by making your proposals more relevant and persuasive—but results still depend on your offer and execution..' },
  { q: 'Can I white-label?', a: 'Agency plan supports white-label PDF exports.' },
  { q: 'What happens if I don’t like the results?', a: 'You can regenerate, edit, or refine the output instantly until it fits your needs.' },
  { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription anytime with no long-term commitment.' },
]

export default function Home() {
  const revealRef = useScrollReveal<HTMLDivElement>()
  const [typed, setTyped] = useState('')
  const full =
    'Rebuild our marketing site, integrate HubSpot forms, and launch in 6 weeks with weekly milestones.'
  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      i += 1
      setTyped(full.slice(0, i))
      if (i >= full.length) clearInterval(t)
    }, 35)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0908] text-[#e8e0d0]" ref={revealRef}>
      <Navbar />
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-4 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(212,168,67,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,168,67,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(900px,100vw)] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(212,168,67,0.25),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-pill border border-white/10 bg-[#111009] px-4 py-1.5 text-xs font-mono mb-8 reveal">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2dd4b0] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2dd4b0]" />
            </span>
            AI-Powered · Free to start
          </div>
          <h1 className="font-fraunces text-5xl sm:text-7xl lg:text-[96px] leading-[1.05] reveal">
            Write proposals that{' '}
            <span className="italic text-[#d4a843]">actually</span> win
          </h1>
          <p className="mt-6 text-lg text-[rgba(232,224,208,0.7)] max-w-2xl mx-auto reveal">
            Describe your project. We will create a complete, client-ready
            proposal in seconds.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center reveal">
            <Button size="lg" className="text-base px-8 rounded-md" asChild>
              <Link to="/signup">✦ Generate Free Proposal</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <a href="#how">▶ Watch 90-sec Demo</a>
            </Button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-3 reveal">
            <div className="flex -space-x-3">
              {['🧑‍💻', '👩‍🎨', '👨‍💼', '🧑‍🔧', '👩‍🏫'].map((e, i) => (
                <span
                  key={i}
                  className="h-10 w-10 rounded-full bg-[#1e1b14] border-2 border-[#0a0908] flex items-center justify-center text-lg"
                >
                  {e}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              1,200+ freelancers joined
            </p>
          </div>
        </div>
        <div className="relative z-10 w-full max-w-5xl mx-auto mt-16 mb-8 reveal">
          <div className="rounded-xl border border-white/10 bg-[#111009] shadow-elevated overflow-hidden">
            <div className="h-9 flex items-center gap-2 px-3 border-b border-white/10 bg-[#161410]">
              <span className="h-3 w-3 rounded-full bg-[#e8673a]/80" />
              <span className="h-3 w-3 rounded-full bg-[#d4a843]/80" />
              <span className="h-3 w-3 rounded-full bg-[#2dd4b0]/80" />
            </div>
            <div className="grid md:grid-cols-2 gap-0 min-h-[280px]">
              <div className="p-4 border-r border-white/10 space-y-2 text-xs font-mono text-muted-foreground">
                <p className="text-[#d4a843]">Client · Aurora Labs</p>
                <p>Budget · $18,000</p>
                <p>Timeline · 6 weeks</p>
                <p className="text-foreground mt-3">Project description</p>
                <p className="text-[rgba(232,224,208,0.85)] min-h-[4rem]">{typed}</p>
              </div>
              <div className="p-6 flex flex-col justify-center gap-3">
                <div
                  className="h-3 rounded bg-gradient-to-r from-white/5 via-white/15 to-white/5 bg-[length:200%_100%] animate-shimmer"
                />
                <div className="h-3 rounded bg-white/10 w-4/5" />
                <div className="h-3 rounded bg-white/10 w-3/5" />
                <div className="flex gap-2 mt-4">
                  <Badge variant="teal">✓ Ready to send</Badge>
                  <Badge variant="default">Score: 91/100</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#111009] py-12 reveal">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            ['2.4k+', 'Proposals'],
            ['68%', 'Win rate lift'],
            ['3 min', 'Time to proposal'],
            ['$840k+', 'Won on platform'],
          ].map(([a, b]) => (
            <div key={b}>
              <p className="font-fraunces text-3xl text-[#d4a843]">{a}</p>
              <p className="text-xs font-mono text-muted-foreground mt-1">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="py-24 px-4 max-w-6xl mx-auto">
        <h2 className="font-fraunces text-4xl text-center mb-16 reveal">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              n: '01',
              title: 'Describe the win',
              body: 'Share client context, scope hints, budget, and tone — we handle structure.',
              icon: Sparkles,
            },
            {
              n: '02',
              title: 'Generate & refine',
              body: 'Gemini drafts every section. Edit inline or improve with one-click AI.',
              icon: Eye,
            },
            {
              n: '03',
              title: 'Send & track',
              body: 'Share a live link, track opens, collect signatures, export PDF.',
              icon: Mail,
            },
          ].map((s, i) => (
            <div key={s.n} className="relative reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="absolute -top-6 left-0 font-fraunces text-7xl text-white/[0.04] select-none">
                {s.n}
              </span>
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-[#d4a843]/20 text-[#d4a843] mb-4">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="font-fraunces text-xl mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="py-24 px-4 max-w-7xl mx-auto">
        <h2 className="font-fraunces text-4xl text-center mb-4 reveal">
          Everything to close faster
        </h2>
        <p className="text-center text-muted-foreground mb-12 reveal">
          Bento grid of capabilities — from AI drafting to signatures.
        </p>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 reveal">
          <div
            className="grid grid-cols-12 gap-4 auto-rows-[minmax(140px,auto)] min-w-[720px] md:min-w-0"
            style={{
              gridTemplateAreas: `
              "a a a a a b b b b b b b"
              "a a a a a b b b b b b b"
              "c c c c d d d d e e e e"
              "c c c c d d d d e e e e"
              "f f f f f f g g h h h h"
              "f f f f f f g g h h h h"
            `,
            }}
          >
            <BentoCard area="a" title="Smart AI Generation" badge="Free+">
              <p className="text-xs text-muted-foreground mb-3">
                Powered by Google Gemini
              </p>
              <div className="flex flex-wrap gap-2">
                {['Professional', 'Friendly', 'Bold', 'Creative'].map((t) => (
                  <span
                    key={t}
                    className={cn(
                      'text-xs font-mono px-2 py-1 rounded-pill border',
                      t === 'Professional'
                        ? 'border-[#d4a843] bg-[#d4a843]/15 text-[#f0c96a]'
                        : 'border-white/10 text-muted-foreground'
                    )}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </BentoCard>
            <BentoCard area="b" title="Real-Time Open Tracking" badge="Pro">
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#2dd4b0]" /> Viewing now
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#d4a843]" /> Opened 3×
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#e8673a]" /> Not opened
                </li>
              </ul>
            </BentoCard>
            <BentoCard area="c" title="Proposal Score" badge="Pro">
              <div className="flex items-center gap-4">
                <svg width="72" height="72" className="-rotate-90">
                  <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle cx="36" cy="36" r="30" fill="none" stroke="#d4a843" strokeWidth="8" strokeDasharray="188" strokeDashoffset="17" strokeLinecap="round" />
                </svg>
                <div className="text-sm space-y-1">
                  <p className="text-[#2dd4b0]">★ Clear scope</p>
                  <p className="text-[#d4a843]">⚠ Add case study</p>
                </div>
              </div>
            </BentoCard>
            <BentoCard area="d" title="E-Signature" badge="Pro">
              <div className="border border-dashed border-white/20 rounded-md py-6 text-center font-fraunces italic text-lg text-black/70 bg-[#faf8f4]/10">
                Alex Morgan
              </div>
              <p className="text-xs text-[#2dd4b0] mt-2">✓ Legally binding</p>
            </BentoCard>
            <BentoCard area="e" title="AI Follow-Up Emails" badge="Pro">
              <Mail className="h-8 w-8 text-[#d4a843] mb-2" />
              <p className="text-xs text-muted-foreground">
                Warm nudges generated from proposal context — never spammy.
              </p>
            </BentoCard>
            <BentoCard area="f" title="Analytics" badge="Pro">
              <div className="flex items-end gap-1 h-20">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex-1 rounded-t bg-white/10',
                      [2, 5, 7].includes(i) && 'bg-[#d4a843]'
                    )}
                    style={{ height: `${30 + (i * 7) % 100}%` }}
                  />
                ))}
              </div>
              <p className="text-xs mt-2 font-mono">
                Win Rate <span className="text-[#d4a843]">72%</span> · MRR Won{' '}
                <span className="text-[#2dd4b0]">$18,400</span>
              </p>
            </BentoCard>
            <BentoCard area="g" title="Team Collaboration" badge="Agency">
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-10 w-10 rounded-full bg-white/10 relative"
                  >
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#2dd4b0] border border-[#111009]" />
                  </span>
                ))}
              </div>
            </BentoCard>
            <BentoCard area="h" title="White-Label Mode" badge="Agency">
              <Palette className="h-6 w-6 text-[#d4a843]" />
            </BentoCard>
            <div
              className="col-span-12 rounded-lg border border-white/10 bg-[#161410] p-6 flex flex-col justify-center reveal"
              style={{ gridColumn: 'span 6' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Plug className="h-6 w-6 text-[#d4a843]" />
                <h3 className="font-fraunces text-lg">CRM Integration</h3>
                <Badge variant="secondary">Agency</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {['HubSpot', 'Notion', 'Trello'].map((x) => (
                  <span
                    key={x}
                    className="text-xs font-mono px-3 py-1 rounded-pill border border-white/10"
                  >
                    {x}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 overflow-hidden border-y border-white/10 bg-[#111009]">
        <h2 className="font-fraunces text-3xl text-center mb-10 reveal">
          Loved by operators, not robots
        </h2>
        <div className="relative flex overflow-hidden group">
          <div className="flex gap-6 animate-marquee whitespace-nowrap py-2 group-hover:[animation-play-state:paused]">
            {[...testimonials, ...testimonials].map((t, i) => (
              <Card
                key={i}
                className="w-[300px] shrink-0 border-white/10 bg-[#161410] inline-block whitespace-normal"
              >
                <CardContent className="pt-6">
                  <p className="text-[#d4a843] text-sm mb-2">★★★★★</p>
                  <p className="font-fraunces italic text-lg leading-snug">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p className="mt-4 text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-4 max-w-5xl mx-auto text-center">
        <h2 className="font-fraunces text-4xl mb-4 reveal">Pricing</h2>
        <p className="text-muted-foreground mb-8 reveal">
          Free forever to start. Pro unlocks the revenue stack.
        </p>
        <div className="reveal">
          <Button size="lg" asChild>
            <Link to="/pricing">View full pricing →</Link>
          </Button>
        </div>
      </section>

      <section id="faq" className="py-24 px-4 max-w-5xl mx-auto">
        <h2 className="font-fraunces text-4xl text-center mb-12 reveal">FAQ</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map((f, i) => (
            <Card
              key={f.q}
              className="border-white/10 bg-[#161410] reveal"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <CardContent className="pt-6">
                <h3 className="font-fraunces text-lg mb-2">{f.q}</h3>
                <p className="text-sm text-muted-foreground">{f.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto rounded-2xl border border-[#d4a843]/30 bg-[radial-gradient(ellipse_at_center,rgba(212,168,67,0.2),transparent)] p-12 text-center reveal">
          <h2 className="font-fraunces text-3xl sm:text-4xl mb-6">
            Ship the proposal tonight. Win the deal tomorrow.
          </h2>
          <Button size="lg" asChild>
            <Link to="/signup">✦ Start free — no card</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function BentoCard({
  area,
  title,
  badge,
  children,
}: {
  area: string
  title: string
  badge: string
  children: React.ReactNode
}) {
  return (
    <Card
      className="border-white/10 bg-[#161410] overflow-hidden reveal"
      style={{ gridArea: area }}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-fraunces text-lg">{title}</h3>
          <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
            {badge}
          </Badge>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
