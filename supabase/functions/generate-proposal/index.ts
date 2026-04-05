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
    const { formData, userProfile } = await req.json()

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      },
    })

    const prompt = `You are an expert business proposal writer with 15 years of experience. Write a complete, professional, highly personalised proposal. Address the client directly using "you" and "your". Never use generic filler text. Reference specific details from the project description throughout.

IMPORTANT: Return ONLY a valid JSON object. No markdown, no backticks, no explanation text before or after. Just the raw JSON.

Project details:
- Freelancer/Company: ${userProfile.company_name || userProfile.full_name}
- Industry: ${userProfile.industry || 'General'}
- Services: ${(userProfile.services || []).join(', ') || 'Professional Services'}
- Client Name: ${formData.client_name}
- Project Type: ${formData.project_type}
- Project Description: ${formData.project_description}
- Budget: ${formData.budget}
- Deadline: ${formData.deadline}
- Tone: ${formData.tone}
- Currency: ${formData.currency || 'USD'}

Return this exact JSON structure with all fields filled with real, specific, personalised content:

{
  "title": "Proposal for ${formData.client_name} - ${formData.project_type}",
  "executive_summary": "Compelling 3-4 sentence opening referencing the client by name and their specific challenge",
  "understanding": "2-3 paragraphs showing deep understanding of what the client needs and why it matters to their business",
  "scope": [
    "Specific deliverable 1 with clear detail",
    "Specific deliverable 2 with clear detail",
    "Specific deliverable 3 with clear detail",
    "Specific deliverable 4 with clear detail",
    "Specific deliverable 5 with clear detail"
  ],
  "exclusions": [
    "What is explicitly NOT included 1",
    "What is explicitly NOT included 2",
    "What is explicitly NOT included 3"
  ],
  "timeline": [
    {"phase": "Phase 1: Discovery & Planning", "duration": "Week 1", "description": "Detailed description of activities"},
    {"phase": "Phase 2: Design & Development", "duration": "Weeks 2-4", "description": "Detailed description"},
    {"phase": "Phase 3: Review & Revisions", "duration": "Week 5", "description": "Detailed description"},
    {"phase": "Phase 4: Final Delivery", "duration": "Week 6", "description": "Detailed description"}
  ],
  "pricing": [
    {"item": "Service or deliverable name", "description": "Brief description", "amount": "${formData.currency || 'USD'} amount"},
    {"item": "Service or deliverable name", "description": "Brief description", "amount": "amount"},
    {"item": "Service or deliverable name", "description": "Brief description", "amount": "amount"}
  ],
  "total": "Total in ${formData.currency || 'USD'} with currency symbol",
  "payment_terms": "e.g. 50% deposit upfront, 50% on final delivery",
  "why_us": "2-3 paragraphs on why this freelancer/agency is the right fit for this specific client and project",
  "terms": [
    "Revisions: X rounds of revisions included, additional revisions billed at hourly rate",
    "Payment: Invoice due within 14 days of issue",
    "Intellectual Property: Full ownership transfers to client upon final payment",
    "Confidentiality: All project information kept strictly confidential",
    "Cancellation: Either party may cancel with 14 days written notice"
  ],
  "next_steps": "Clear, specific call to action for the client to proceed",
  "score": 88,
  "score_feedback": [
    {"type": "strength", "message": "Specific strength of this proposal"},
    {"type": "strength", "message": "Another specific strength"},
    {"type": "warning", "message": "A specific improvement suggestion"},
    {"type": "warning", "message": "Another improvement suggestion"}
  ]
}`

    const result = await model.generateContent(prompt)
    let responseText = result.response.text()

    responseText = responseText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim()

    let proposalData: unknown
    try {
      proposalData = JSON.parse(responseText)
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        proposalData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Gemini returned invalid JSON. Please try again.')
      }
    }

    return new Response(JSON.stringify({ success: true, data: proposalData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('generate-proposal error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
