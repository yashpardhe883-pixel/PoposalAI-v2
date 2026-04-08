import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const { to, type, data } = payload
    
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    let subject = 'New Message'
    let html = '<p>You have a new message.</p>'

    if (type === 'proposal_sent') {
      subject = `You received a new proposal: ${data.title}`
      html = `<p>Hello,</p><p>You received a new proposal: ${data.title}.</p><p><a href="${data.link}">View Proposal</a></p>`
    } else if (type === 'follow_up') {
      subject = `Checking in on: ${data.title}`
      html = `<p>Hello,</p><p>We wanted to follow up on the proposal: ${data.title}.</p><p><a href="${data.link}">View Proposal</a></p>`
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ProposalAI <hello@proposalai.com>', 
        to: [to],
        subject: subject,
        html: html,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || 'Failed to send email via Resend')
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
