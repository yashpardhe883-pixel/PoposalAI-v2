import { Link } from 'react-router-dom'
import { Sparkles, LayoutTemplate } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function NewProposal() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link
        to="/dashboard"
        className="text-sm text-muted-foreground hover:text-[#d4a843] inline-flex items-center gap-1 mb-8"
      >
        ← Back to Dashboard
      </Link>
      <h1 className="font-fraunces text-3xl text-center mb-2">
        How do you want to start?
      </h1>
      <p className="text-center text-muted-foreground text-sm mb-10">
        Smart mode is fastest. Template mode gives you more structure.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="group border-white/10 hover:border-[#d4a843]/50 hover:shadow-[0_0_40px_rgba(212,168,67,0.15)] transition-all hover:scale-[1.02] cursor-pointer">
          <Link to="/proposals/new/smart">
            <CardContent className="pt-8 pb-8 px-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-[#d4a843]/20 p-3 text-[#d4a843]">
                  <Sparkles className="h-8 w-8" />
                </div>
                <Badge variant="teal" className="rounded-pill">
                  Fastest — 2 min
                </Badge>
              </div>
              <h2 className="font-fraunces text-2xl mb-2">Smart Mode</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Answer a few questions and let Gemini draft a complete,
                personalised proposal tailored to your client.
              </p>
              <Button className="w-full">Use Smart Mode →</Button>
            </CardContent>
          </Link>
        </Card>
        <Card className="group border-white/10 hover:border-white/20 hover:scale-[1.02] transition-all cursor-pointer">
          <Link to="/proposals/new/template">
            <CardContent className="pt-8 pb-8 px-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-white/10 p-3">
                  <LayoutTemplate className="h-8 w-8 text-foreground" />
                </div>
                <Badge variant="secondary" className="rounded-pill">
                  Most structured
                </Badge>
              </div>
              <h2 className="font-fraunces text-2xl mb-2">Template Mode</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Start from a proven industry template, then customise every
                section before generating with AI.
              </p>
              <Button variant="outline" className="w-full">
                Browse Templates →
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}
