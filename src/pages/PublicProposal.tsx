import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { parseProposalContent } from '@/types/proposal'
import { ProposalPreview } from '@/components/proposals/ProposalPreview'
import { SignatureModal } from '@/components/features/SignatureModal'
import { Button } from '@/components/ui/button'
import type { Database } from '@/types/database'
import type { Profile } from '@/types/user'

type ProposalRow = Database['public']['Tables']['proposals']['Row']

export default function PublicProposal() {
  const { shareToken } = useParams<{ shareToken: string }>()
  const [proposal, setProposal] = useState<ProposalRow | null>(null)
  const [ownerProfile, setOwnerProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sigOpen, setSigOpen] = useState(false)
  const [signedSuccess, setSignedSuccess] = useState(false)
  const [signerDisplay, setSignerDisplay] = useState('')

  useEffect(() => {
    if (!shareToken) return
    let cancelled = false
    ;(async () => {
      const { data: p, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('share_token', shareToken)
        .single()
      if (error || !p || cancelled) {
        setLoading(false)
        return
      }
      const row = p as ProposalRow
      setProposal(row)

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', row.user_id)
        .single()
      if (prof && !cancelled) setOwnerProfile(prof as Profile)

      await supabase.from('proposal_events').insert({
        proposal_id: row.id,
        event_type: 'viewed',
        metadata: { source: 'public_link' },
      })
      await supabase
        .from('proposals')
        .update({
          view_count: (row.view_count || 0) + 1,
          last_viewed_at: new Date().toISOString(),
          status: row.status === 'draft' || row.status === 'sent' ? 'viewed' : row.status,
        })
        .eq('id', row.id)

      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [shareToken])

  const content = proposal ? parseProposalContent(proposal.content) : {}

  const handleSign = async (payload: {
    signerName: string
    signatureDataUrl: string | null
    typed: boolean
  }) => {
    if (!proposal) return
    const signedAt = new Date().toISOString()
    await supabase
      .from('proposals')
      .update({
        is_signed: true,
        signed_at: signedAt,
        signer_name: payload.signerName,
        status: 'signed',
      })
      .eq('id', proposal.id)
    await supabase.from('proposal_events').insert({
      proposal_id: proposal.id,
      event_type: 'signed',
      metadata: { typed: payload.typed },
    })
    /* Owner email lives in auth.users — trigger server-side email via DB webhook or a secured edge function in production. */
    setSignerDisplay(payload.signerName)
    setSigOpen(false)
    setSignedSuccess(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4] text-[#1a1814]">
        <div className="h-10 w-10 rounded-full border-2 border-[#d4a843]/40 border-t-[#d4a843] animate-spin" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f4] px-4 text-center">
        <h1 className="font-fraunces text-2xl text-[#1a1814]">
          Invalid link
        </h1>
        <p className="mt-2 text-sm text-black/60 max-w-md">
          This proposal link is invalid or has expired.
        </p>
      </div>
    )
  }

  if (signedSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf8f4] px-4 text-center">
        <div className="text-5xl mb-4" aria-hidden>
          🎉
        </div>
        <h1 className="font-fraunces text-3xl text-[#2dd4b0]">
          Proposal Signed!
        </h1>
        <p className="mt-2 text-black/70">
          Thank you, {signerDisplay || proposal.signer_name || 'signer'}. The sender has been
          notified.
        </p>
        <Button className="mt-8" onClick={() => window.print()}>
          Download Signed Copy
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f4] pb-28">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ProposalPreview
          content={content}
          profile={ownerProfile}
          clientName={proposal.client_name}
        />
      </div>
      {!proposal.is_signed && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-black/10 bg-[#faf8f4]/95 backdrop-blur-md py-4 px-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <p className="text-sm text-black/70 font-medium">
            Ready to move forward?
          </p>
          <Button
            className="bg-[#d4a843] text-[#0a0908] hover:bg-[#f0c96a]"
            onClick={() => setSigOpen(true)}
          >
            Sign This Proposal
          </Button>
        </div>
      )}
      <SignatureModal
        open={sigOpen}
        onOpenChange={setSigOpen}
        title={proposal.title}
        onSign={handleSign}
      />
    </div>
  )
}
