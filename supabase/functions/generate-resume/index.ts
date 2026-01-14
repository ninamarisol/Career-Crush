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
    const { masterResume, jobDescription, jobTitle, company } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!masterResume || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Master resume and job description are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume optimizer. Your task is to create a one-page, ATS-optimized resume based on the candidate's master resume, tailored specifically for the job description provided.

CRITICAL GUIDELINES:
1. Output ONLY the resume content in clean, parseable text format
2. Keep it to ONE PAGE maximum (approximately 400-500 words)
3. Use simple formatting that ATS systems can parse:
   - Use clear section headers in ALL CAPS
   - Use bullet points (•) for lists
   - No tables, columns, or complex formatting
4. Prioritize relevant experience and skills that match the job description
5. Use keywords from the job description naturally
6. Quantify achievements where possible
7. Keep the professional summary to 2-3 lines
8. Select only the most relevant 3-4 experiences
9. List only skills mentioned in or relevant to the job description

RESUME FORMAT:
[FULL NAME]
[Email] | [Phone] | [Location] | [LinkedIn URL if available]

PROFESSIONAL SUMMARY
[2-3 sentences tailored to the role]

SKILLS
[Comma-separated list of relevant skills]

PROFESSIONAL EXPERIENCE
[Job Title] | [Company] | [Location] | [Dates]
• [Achievement/responsibility with metrics if possible]
• [Achievement/responsibility]

[Additional relevant positions...]

EDUCATION
[Degree] | [School] | [Graduation Date]

CERTIFICATIONS (if relevant)
[Certification names]

PROJECTS (if relevant and space permits)
[Project name] - [Brief description]`;

    const userPrompt = `Create an ATS-optimized, one-page resume for this position:

JOB TITLE: ${jobTitle || 'Position'}
COMPANY: ${company || 'Company'}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S MASTER RESUME:
${JSON.stringify(masterResume, null, 2)}

Generate the optimized resume now. Remember: ONE PAGE ONLY, ATS-friendly format, prioritize relevance to this specific job.`;

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
        stream: true,
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
        JSON.stringify({ error: "Failed to generate resume" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("generate-resume error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});