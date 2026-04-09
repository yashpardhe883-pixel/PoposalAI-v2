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
    const { section, currentContent, context } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing')

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const prompt = `
You are an expert copywriter. 
Please improve the following section of a proposal: "${section}"
Context: ${JSON.stringify(context)}
Current Content: ${currentContent}

RESPOND EXCLUSIVELY IN VALID JSON FORMAT. Do not use markdown blocks.
Structure:
{
  "improvedContent": "..."
}
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    let parsedData
    try {
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
      parsedData = JSON.parse(cleanJson)
    } catch {
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
