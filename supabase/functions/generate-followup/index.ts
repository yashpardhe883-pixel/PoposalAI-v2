import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { proposal, userProfile, daysSinceSent } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing')

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const prompt = `
You are an expert sales strategist.
Write a professional follow-up email for this proposal that was sent ${daysSinceSent} days ago.
Proposal Title: ${proposal.title}
Client: ${proposal.client_name}
Sender: ${userProfile.full_name} (${userProfile.company_name})

RESPOND EXCLUSIVELY IN VALID JSON FORMAT. Do not use markdown blocks.
Structure:
{
  "subject": "Checking in: [Topic]",
  "body": "..."
}
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    let parsedData
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
      parsedData = JSON.parse(cleanJson)
    } catch (err) {
      throw new Error('Failed to parse Gemini output.')
    }

    return new Response(JSON.stringify({ success: true, data: parsedData }), {
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
