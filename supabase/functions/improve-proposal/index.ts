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
    const { section, currentContent, context } = await req.json()

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are an expert proposal writer. Improve the following proposal section.

Section: ${section}
Client: ${context.client_name}
Project: ${context.project_type}
Tone: ${context.tone}

Current content:
${currentContent}

Rewrite this section to be more compelling, specific, and persuasive.
Keep approximately the same length.
Return ONLY the improved text, no explanation, no JSON, just the rewritten content.`

    const result = await model.generateContent(prompt)
    const improved = result.response.text().trim()

    return new Response(JSON.stringify({ success: true, data: improved }), {
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
