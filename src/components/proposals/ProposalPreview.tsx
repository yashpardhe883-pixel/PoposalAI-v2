import type { ProposalContent } from '@/types/proposal'
import type { Profile } from '@/types/user'
import { formatDate } from '@/lib/utils'

export function ProposalPreview({
  content,
  profile,
  clientName,
}: {
  content: ProposalContent
  profile: Profile | null
  clientName: string
}) {
  const brand = profile?.brand_color || '#d4a843'
  const company = profile?.company_name || profile?.full_name || 'Your Company'

  return (
    <div
      className="rounded-lg border border-black/10 bg-[#faf8f4] text-[#1a1814] shadow-inner overflow-hidden flex flex-col min-h-[480px] max-h-[calc(100vh-8rem)]"
      style={{ fontFamily: 'Outfit, sans-serif' }}
    >
      <header
        className="shrink-0 px-6 py-4 flex items-center gap-4 border-b border-black/10"
        style={{ borderBottomColor: `${brand}55` }}
      >
        {profile?.logo_url ? (
          <img
            src={profile.logo_url}
            alt=""
            className="h-10 w-auto max-w-[120px] object-contain"
          />
        ) : (
          <div
            className="h-10 w-10 rounded-md flex items-center justify-center text-sm font-fraunces font-bold text-[#0a0908]"
            style={{ backgroundColor: brand }}
          >
            {company.slice(0, 1)}
          </div>
        )}
        <div
          className="h-1 flex-1 rounded-full"
          style={{ backgroundColor: brand }}
        />
        <span className="text-xs font-mono text-black/50">
          {formatDate(new Date())}
        </span>
      </header>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-8">
        <div>
          <h1 className="font-fraunces text-2xl sm:text-3xl">
            {content.title || `Proposal for ${clientName}`}
          </h1>
          <p className="mt-2 text-sm text-black/60">Prepared by {company}</p>
        </div>
        {content.executive_summary && (
          <Section title="Executive Summary" body={content.executive_summary} />
        )}
        {content.understanding && (
          <Section title="Understanding of Brief" body={content.understanding} />
        )}
        {content.scope && content.scope.length > 0 && (
          <div>
            <h2 className="font-fraunces text-xl mb-3">Scope of Work</h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed">
              {content.scope.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </div>
        )}
        {content.exclusions && content.exclusions.length > 0 && (
          <div className="opacity-70">
            <h2 className="font-fraunces text-lg mb-2">What&apos;s Not Included</h2>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {content.exclusions.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        {content.timeline && content.timeline.length > 0 && (
          <div>
            <h2 className="font-fraunces text-xl mb-4">Timeline</h2>
            <div className="space-y-3">
              {content.timeline.map((t, i) => (
                <div
                  key={i}
                  className="rounded-md border border-black/10 p-4 bg-white/60"
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">{t.phase}</span>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-pill shrink-0"
                      style={{ backgroundColor: `${brand}22`, color: '#1a1814' }}
                    >
                      {t.duration}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-black/70">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {content.pricing && content.pricing.length > 0 && (
          <div>
            <h2 className="font-fraunces text-xl mb-3">Investment</h2>
            <table className="w-full text-sm border border-black/10 rounded-md overflow-hidden">
              <thead className="bg-black/5">
                <tr>
                  <th className="text-left p-2 font-mono text-xs">Item</th>
                  <th className="text-left p-2 font-mono text-xs">Details</th>
                  <th className="text-right p-2 font-mono text-xs">Amount</th>
                </tr>
              </thead>
              <tbody>
                {content.pricing.map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? 'bg-white/80' : 'bg-white/40'}
                  >
                    <td className="p-2 font-medium">{row.item}</td>
                    <td className="p-2 text-black/65">{row.description}</td>
                    <td className="p-2 text-right font-mono">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
              {content.total && (
                <tfoot>
                  <tr className="font-bold bg-black/10">
                    <td colSpan={2} className="p-2">
                      Total
                    </td>
                    <td className="p-2 text-right font-mono">{content.total}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
        {content.payment_terms && (
          <Section title="Payment Terms" body={content.payment_terms} />
        )}
        {content.why_us && (
          <Section title="Why Choose Us" body={content.why_us} />
        )}
        {content.terms && content.terms.length > 0 && (
          <div>
            <h2 className="font-fraunces text-lg mb-2">Terms &amp; Conditions</h2>
            <ol className="list-decimal pl-5 text-xs space-y-1 text-black/70">
              {content.terms.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ol>
          </div>
        )}
        {content.next_steps && (
          <div
            className="rounded-lg p-4 border-2"
            style={{ borderColor: brand, backgroundColor: `${brand}14` }}
          >
            <h2 className="font-fraunces text-xl mb-2">Next Steps</h2>
            <p className="text-sm leading-relaxed">{content.next_steps}</p>
          </div>
        )}
      </div>
      <footer className="shrink-0 border-t border-black/10 px-6 py-2 text-[10px] text-black/45 flex justify-between font-mono">
        <span>Preview</span>
        <span>{company}</span>
      </footer>
    </div>
  )
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="font-fraunces text-xl mb-2">{title}</h2>
      <div className="text-sm leading-relaxed whitespace-pre-wrap text-black/80">
        {body}
      </div>
    </div>
  )
}
