import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, type, data } = await req.json()
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

    const templates: Record<string, { subject: string; html: string }> = {
      proposal_viewed: {
        subject: `👁 ${data.client_name} just opened your proposal`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
            <h2 style="color:#d4a843">Proposal Opened!</h2>
            <p><strong>${data.client_name}</strong> just opened your proposal
            <em>"${data.proposal_title}"</em>.</p>
            <p>This is a great time to follow up while it's fresh in their mind.</p>
            <a href="${data.proposal_url}"
               style="background:#d4a843;color:#000;padding:12px 24px;
                      border-radius:8px;text-decoration:none;display:inline-block;
                      margin-top:16px;font-weight:bold">
              View Proposal →
            </a>
          </div>`,
      },
      proposal_signed: {
        subject: `✅ ${data.client_name} signed your proposal!`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
            <h2 style="color:#2dd4b0">Proposal Signed!</h2>
            <p>Great news! <strong>${data.client_name}</strong> has signed
            <em>"${data.proposal_title}"</em>.</p>
            <p>Signed at: ${data.signed_at}</p>
            <a href="${data.proposal_url}"
               style="background:#d4a843;color:#000;padding:12px 24px;
                      border-radius:8px;text-decoration:none;display:inline-block;
                      margin-top:16px;font-weight:bold">
              View Signed Proposal →
            </a>
          </div>`,
      },
      team_invite: {
        subject: `You're invited to join ${data.agency_name} on ProposalAI`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
            <h2 style="color:#d4a843">Team Invitation</h2>
            <p>${data.inviter_name} has invited you to join their team
            on ProposalAI.</p>
            <a href="${data.invite_url}"
               style="background:#d4a843;color:#000;padding:12px 24px;
                      border-radius:8px;text-decoration:none;display:inline-block;
                      margin-top:16px;font-weight:bold">
              Accept Invitation →
            </a>
          </div>`,
      },
    }

    const template = templates[type]
    if (!template) {
      return new Response(JSON.stringify({ error: 'Unknown email type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ProposalAI <notifications@yourdomain.com>',
        to: [to],
        subject: template.subject,
        html: template.html,
      }),
    })

    const result = await res.json()
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
