import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — manage subscriptions in the Stripe Customer Portal.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Contact support — we handle refunds case-by-case.',
  },
  {
    q: 'Is my data secure?',
    a: 'Hosted on Supabase with row-level security and encrypted transit.',
  },
]

const features = [
  ['AI generation (Gemini)', true, true, true],
  ['Unlimited proposals', false, true, true],
  ['Analytics', false, true, true],
  ['Branding & logo', false, true, true],
  ['E-signatures', false, true, true],
  ['Team seats', false, false, true],
  ['White-label PDFs', false, false, true],
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)
  const proPrice = annual ? 171 / 12 : 19
  const agencyPrice = annual ? 621 / 12 : 69

  return (
    <div className="min-h-screen bg-[#0a0908]">
      <Navbar />
      <main className="pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-fraunces text-4xl sm:text-5xl mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start free. Upgrade when you&apos;re ready to win more work.
          </p>
          <div className="mt-6 inline-flex rounded-pill border border-white/10 p-1 bg-[#111009]">
            <button
              type="button"
              className={cn(
                'px-4 py-2 rounded-pill text-sm font-mono transition-colors',
                !annual && 'bg-[#d4a843] text-[#0a0908]'
              )}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </button>
            <button
              type="button"
              className={cn(
                'px-4 py-2 rounded-pill text-sm font-mono transition-colors',
                annual && 'bg-[#d4a843] text-[#0a0908]'
              )}
              onClick={() => setAnnual(true)}
            >
              Annual <span className="text-[#2dd4b0]">−25%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-white/10">
            <CardHeader>
              <h3 className="font-fraunces text-2xl">Free</h3>
              <p className="text-3xl font-fraunces mt-2">
                $0<span className="text-sm text-muted-foreground">/mo</span>
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>5 proposals / month</li>
                <li>AI Smart Mode</li>
                <li>Public share links</li>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/signup">Start Free</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-[#d4a843] border-2 relative shadow-elevated scale-[1.02]">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-pill">
              Most Popular
            </Badge>
            <CardHeader>
              <h3 className="font-fraunces text-2xl">Pro</h3>
              <p className="text-3xl font-fraunces mt-2 text-[#d4a843]">
                ${proPrice.toFixed(0)}
                <span className="text-sm text-muted-foreground">/mo</span>
              </p>
              {annual && (
                <p className="text-xs text-muted-foreground">Billed annually</p>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>Unlimited proposals</li>
                <li>Analytics & scoring</li>
                <li>Branding & PDF export</li>
                <li>E-signatures</li>
              </ul>
              <Button className="w-full" asChild>
                <Link to="/signup">Go Pro</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="border-white/10">
            <CardHeader>
              <h3 className="font-fraunces text-2xl">Agency</h3>
              <p className="text-3xl font-fraunces mt-2">
                ${agencyPrice.toFixed(0)}
                <span className="text-sm text-muted-foreground">/mo</span>
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>Everything in Pro</li>
                <li>Team collaboration</li>
                <li>White-label exports</li>
                <li>CRM-ready workflows</li>
              </ul>
              <Button variant="secondary" className="w-full" asChild>
                <Link to="/signup">Contact Sales</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 mb-16 overflow-x-auto">
          <CardHeader>
            <h2 className="font-fraunces text-2xl">Feature comparison</h2>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Free</TableHead>
                  <TableHead>Pro</TableHead>
                  <TableHead>Agency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map(([name, f, p, a]) => (
                  <TableRow key={String(name)}>
                    <TableCell>{name}</TableCell>
                    <TableCell>
                      {f ? <Check className="h-4 w-4 text-[#2dd4b0]" /> : '—'}
                    </TableCell>
                    <TableCell>
                      {p ? <Check className="h-4 w-4 text-[#2dd4b0]" /> : '—'}
                    </TableCell>
                    <TableCell>
                      {a ? <Check className="h-4 w-4 text-[#2dd4b0]" /> : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {faqs.map((f) => (
            <Card key={f.q} className="border-white/10">
              <CardHeader>
                <h3 className="font-fraunces text-lg">{f.q}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{f.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-2xl border border-[#d4a843]/30 bg-[radial-gradient(ellipse_at_top,#d4a84333,transparent)] p-10 text-center">
          <h2 className="font-fraunces text-3xl mb-4">
            Ready to win your next deal?
          </h2>
          <Button size="lg" asChild>
            <Link to="/signup">✦ Start free today</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
