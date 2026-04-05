import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

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
    const { proposal, userProfile, daysSinceSent } = await req.json()

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Write a short, warm follow-up email for a proposal.

Context:
- Sender: ${userProfile.full_name} from ${userProfile.company_name || 'their company'}
- Client: ${proposal.client_name}
- Proposal title: ${proposal.title}
- Sent ${daysSinceSent} days ago, client hasn't responded yet

Rules:
- Maximum 120 words in the body
- Friendly but professional tone
- Reference the proposal naturally — don't sound desperate
- End with one clear, easy-to-answer question
- Do NOT use phrases like "I hope this email finds you well"
- Sound human, not automated

Return ONLY valid JSON with no markdown, no backticks, just raw JSON:
{"subject": "email subject line here", "body": "full email body text here"}`

    const result = await model.generateContent(prompt)
    let text = result.response.text()
    text = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim()

    let parsed: { subject: string; body: string }
    try {
      parsed = JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      parsed = match
        ? JSON.parse(match[0])
        : { subject: 'Following up on our proposal', body: text }
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
