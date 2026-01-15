import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, jobDescription, jobTitle, company } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!resumeText || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Resume text and job description are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume analyzer. Your task is to analyze a resume against a job description and provide a detailed score breakdown with actionable feedback.

OUTPUT FORMAT (JSON only, no markdown):
{
  "overallScore": <number 0-100>,
  "categories": {
    "keywords": {
      "score": <number 0-100>,
      "feedback": "<specific feedback>",
      "matchedKeywords": ["<keyword1>", "<keyword2>"],
      "missingKeywords": ["<keyword1>", "<keyword2>"]
    },
    "experience": {
      "score": <number 0-100>,
      "feedback": "<specific feedback>"
    },
    "skills": {
      "score": <number 0-100>,
      "feedback": "<specific feedback>",
      "matchedSkills": ["<skill1>", "<skill2>"],
      "missingSkills": ["<skill1>", "<skill2>"]
    },
    "formatting": {
      "score": <number 0-100>,
      "feedback": "<specific feedback>"
    },
    "impact": {
      "score": <number 0-100>,
      "feedback": "<specific feedback about quantifiable achievements>"
    }
  },
  "topImprovements": [
    "<improvement 1>",
    "<improvement 2>",
    "<improvement 3>"
  ],
  "summary": "<2-3 sentence overall assessment>"
}

SCORING GUIDELINES:
- Keywords (25%): How well does the resume include keywords from the job description?
- Experience (25%): Does the experience match the job requirements?
- Skills (20%): Are the required skills present?
- Formatting (15%): Is the resume ATS-friendly (no tables, graphics, proper sections)?
- Impact (15%): Are achievements quantified with metrics?`;

    const userPrompt = `Analyze this resume for the following position:

JOB TITLE: ${jobTitle || 'Position'}
COMPANY: ${company || 'Company'}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

Provide the JSON analysis now.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze resume" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from the response (handle potential markdown code blocks)
    let analysis;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse resume analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-resume error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
