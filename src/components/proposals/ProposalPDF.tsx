import { forwardRef } from 'react'
import type { ProposalContent } from '@/types/proposal'
import type { Profile } from '@/types/user'
import { formatDate } from '@/lib/utils'

/** Hidden full document for PDF capture */
export const ProposalPDF = forwardRef<
  HTMLDivElement,
  {
    content: ProposalContent
    profile: Profile | null
    clientName: string
    showWatermark?: boolean
  }
>(function ProposalPDF({ content, profile, clientName, showWatermark }, ref) {
  const brand = profile?.brand_color || '#d4a843'
  const company = profile?.company_name || profile?.full_name || 'Your Company'

  return (
    <div
      ref={ref}
      className="bg-[#faf8f4] text-[#1a1814] p-8 w-[794px]"
      style={{ fontFamily: 'Outfit, sans-serif' }}
    >
      <div
        className="h-2 w-full rounded mb-6"
        style={{ backgroundColor: brand }}
      />
      <div className="flex justify-between items-start mb-8">
        {profile?.logo_url ? (
          <img src={profile.logo_url} alt="" className="h-16 object-contain" />
        ) : (
          <div
            className="h-16 w-16 rounded flex items-center justify-center font-fraunces text-2xl font-bold"
            style={{ backgroundColor: brand, color: '#0a0908' }}
          >
            {company.slice(0, 1)}
          </div>
        )}
        <div className="text-right text-xs font-mono text-black/50">
          {formatDate(new Date())}
        </div>
      </div>
      <h1 className="font-fraunces text-3xl mb-2">
        {content.title || `Proposal for ${clientName}`}
      </h1>
      <p className="text-sm text-black/60 mb-8">Prepared by {company}</p>
      {content.executive_summary && (
        <Block title="Executive Summary" text={content.executive_summary} />
      )}
      {content.understanding && (
        <Block title="Understanding" text={content.understanding} />
      )}
      {content.scope && (
        <div className="mb-6">
          <h2 className="font-fraunces text-lg mb-2">Scope</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {content.scope.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {content.pricing && content.pricing.length > 0 && (
        <div className="mb-6">
          <h2 className="font-fraunces text-lg mb-2">Pricing</h2>
          <table className="w-full text-xs border border-black/20">
            <tbody>
              {content.pricing.map((r, i) => (
                <tr key={i} className="border-b border-black/10">
                  <td className="p-2">{r.item}</td>
                  <td className="p-2 text-right font-mono">{r.amount}</td>
                </tr>
              ))}
            </tbody>
            {content.total && (
              <tfoot>
                <tr className="font-bold">
                  <td className="p-2">Total</td>
                  <td className="p-2 text-right font-mono">{content.total}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
      {content.next_steps && (
        <Block title="Next Steps" text={content.next_steps} />
      )}
      {showWatermark && (
        <p className="mt-8 text-center text-xs text-black/40 font-mono">
          Made with ProposalAI · proposalai.com
        </p>
      )}
    </div>
  )
})

ProposalPDF.displayName = 'ProposalPDF'

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-fraunces text-lg mb-1">{title}</h2>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  )
}
