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
    const { formData, userProfile } = await req.json()

    // Initialize Gemini
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing')
    }
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const prompt = `
You are an expert proposal builder. Create a professional proposal.
Client Name: ${formData.client_name}
Project Type: ${formData.project_type}
Project Description: ${formData.project_description}
Budget: ${formData.budget}
Deadline: ${formData.deadline}
Tone: ${formData.tone}
Currency: ${formData.currency}

Sender Profile:
Company Name: ${userProfile.company_name}
Full Name: ${userProfile.full_name}

RESPOND EXCLUSIVELY IN VALID JSON FORMAT. Do not use markdown blocks like \`\`\`json.
The structure must be:
{
  "title": "Proposal for [Client Name] - [Project Type]",
  "executive_summary": "...",
  "solution": "...",
  "deliverables": [
    { "title": "...", "description": "..." }
  ],
  "investment": "...",
  "timeline": "...",
  "score": 85,
  "score_feedback": ["good point 1", "improvement 1"]
}
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    // Parse JSON
    let parsedData
    try {
      // Remove any markdown formatting if present
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
      parsedData = JSON.parse(cleanJson)
    } catch {
      console.error('Failed to parse Gemini output:', responseText)
      throw new Error('Failed to generate proposal: Invalid format from AI')
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
