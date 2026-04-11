import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { formData, userProfile } = body;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "GEMINI_API_KEY not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are an expert business proposal writer. Write a complete professional proposal.

Return ONLY a valid JSON object. No markdown, no backticks, no extra text.

Details:
- Company: ${userProfile?.company_name || userProfile?.full_name || "Our Company"}
- Client: ${formData?.client_name || "Client"}
- Project Type: ${formData?.project_type || "General Project"}
- Description: ${formData?.project_description || "Project description"}
- Budget: ${formData?.budget || "To be discussed"}
- Deadline: ${formData?.deadline || "To be discussed"}
- Tone: ${formData?.tone || "professional"}
- Currency: ${formData?.currency || "USD"}

Return this exact JSON:
{
  "title": "Proposal for ${formData?.client_name} - ${formData?.project_type}",
  "executive_summary": "Write 3-4 compelling sentences about this project",
  "understanding": "Write 2-3 paragraphs showing understanding of client needs",
  "scope": ["Deliverable 1", "Deliverable 2", "Deliverable 3", "Deliverable 4", "Deliverable 5"],
  "exclusions": ["Not included item 1", "Not included item 2"],
  "timeline": [
    {"phase": "Phase 1: Discovery", "duration": "Week 1", "description": "Initial planning and research"},
    {"phase": "Phase 2: Development", "duration": "Weeks 2-4", "description": "Main work delivery"},
    {"phase": "Phase 3: Review", "duration": "Week 5", "description": "Client review and revisions"},
    {"phase": "Phase 4: Launch", "duration": "Week 6", "description": "Final delivery and handover"}
  ],
  "pricing": [
    {"item": "Main Service", "description": "Core deliverable", "amount": "${formData?.currency || "USD"} ${formData?.budget || "TBD"}"},
    {"item": "Additional Support", "description": "Post-delivery support", "amount": "Included"}
  ],
  "total": "${formData?.budget || "To be discussed"}",
  "payment_terms": "50% upfront, 50% on final delivery",
  "why_us": "Write 2 paragraphs explaining why we are the best choice",
  "terms": [
    "Revisions: 3 rounds included",
    "Payment due within 14 days of invoice",
    "Full IP rights transfer upon final payment",
    "Confidentiality maintained throughout"
  ],
  "next_steps": "Please review this proposal and sign to confirm your agreement so we can begin immediately.",
  "score": 85,
  "score_feedback": [
    {"type": "strength", "message": "Clear project scope defined"},
    {"type": "strength", "message": "Transparent pricing structure"},
    {"type": "warning", "message": "Consider adding more specific milestones"},
    {"type": "warning", "message": "Add client testimonials to strengthen credibility"}
  ]
}`;

    // Call Gemini API directly using fetch
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return new Response(
        JSON.stringify({ success: false, error: `Gemini API error: ${errText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();
    let responseText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean response
    responseText = responseText
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/gi, "")
      .trim();

    let proposalData;
    try {
      proposalData = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        proposalData = JSON.parse(match[0]);
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to parse AI response. Please try again.",
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: proposalData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});