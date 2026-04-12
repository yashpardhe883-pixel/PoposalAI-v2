import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    console.log("Function started");
    console.log("GEMINI_API_KEY exists:", !!GEMINI_API_KEY);

    if (!GEMINI_API_KEY) {
      console.log("ERROR: No Gemini API key");
      return new Response(
        JSON.stringify({ success: false, error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    console.log("Body received:", JSON.stringify(body).slice(0, 100));

    const { formData, userProfile } = body;

    const prompt = `You are a professional proposal writer. Write a business proposal and return ONLY a JSON object with no markdown formatting.

Client: ${formData?.client_name || "Client"}
Project: ${formData?.project_type || "Project"}
Description: ${formData?.project_description || "Description"}
Budget: ${formData?.budget || "TBD"}
Deadline: ${formData?.deadline || "TBD"}
Tone: ${formData?.tone || "professional"}
Currency: ${formData?.currency || "USD"}
Company: ${userProfile?.company_name || userProfile?.full_name || "Our Company"}

Return this JSON structure:
{
  "title": "Proposal for ${formData?.client_name} - ${formData?.project_type}",
  "executive_summary": "3-4 sentences about this project",
  "understanding": "2 paragraphs showing understanding of client needs",
  "scope": ["Deliverable 1", "Deliverable 2", "Deliverable 3", "Deliverable 4"],
  "exclusions": ["Not included 1", "Not included 2"],
  "timeline": [
    {"phase": "Phase 1: Discovery", "duration": "Week 1", "description": "Planning and research"},
    {"phase": "Phase 2: Execution", "duration": "Weeks 2-4", "description": "Main delivery"},
    {"phase": "Phase 3: Review", "duration": "Week 5", "description": "Revisions"},
    {"phase": "Phase 4: Launch", "duration": "Week 6", "description": "Final handover"}
  ],
  "pricing": [
    {"item": "Main Service", "description": "Core work", "amount": "${formData?.budget || "TBD"}"},
    {"item": "Support", "description": "Post-delivery", "amount": "Included"}
  ],
  "total": "${formData?.budget || "TBD"}",
  "payment_terms": "50% upfront, 50% on completion",
  "why_us": "2 paragraphs on why we are the right choice",
  "terms": [
    "3 rounds of revisions included",
    "Payment due within 14 days",
    "Full IP rights on final payment",
    "Confidentiality maintained"
  ],
  "next_steps": "Sign this proposal to get started immediately.",
  "score": 85,
  "score_feedback": [
    {"type": "strength", "message": "Clear scope defined"},
    {"type": "strength", "message": "Transparent pricing"},
    {"type": "warning", "message": "Add specific milestones"},
    {"type": "warning", "message": "Include client testimonials"}
  ]
}`;

    console.log("Calling Gemini API...");

    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}',
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 3000 },
        }),
      }
    );

    console.log("Gemini response status:", geminiRes.status);

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.log("Gemini error:", errText);
      return new Response(
        JSON.stringify({ success: false, error: `Gemini error: ${geminiRes.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    console.log("Gemini data received");

    let text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Raw text length:", text.length);

    text = text.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();

    let proposal;
    try {
      proposal = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        proposal = JSON.parse(match[0]);
      } else {
        console.log("JSON parse failed, text:", text.slice(0, 200));
        return new Response(
          JSON.stringify({ success: false, error: "Could not parse AI response" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log("Success! Returning proposal");
    return new Response(
      JSON.stringify({ success: true, data: proposal }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.log("Caught error:", err?.message);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});