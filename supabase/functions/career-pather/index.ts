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
    const { resume, preferences, applications } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from user data
    const resumeContext = resume ? `
## User's Background (Master Resume):
- Summary: ${resume.summary || "Not provided"}
- Skills: ${resume.skills?.join(", ") || "Not provided"}
- Experience: ${resume.experience?.map((exp: any) => `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.current ? "Present" : exp.endDate})`).join("; ") || "Not provided"}
- Education: ${resume.education?.map((edu: any) => `${edu.degree} from ${edu.school}`).join("; ") || "Not provided"}
- Certifications: ${resume.certifications?.join(", ") || "Not provided"}
` : "";

    const preferencesContext = preferences ? `
## User's Dream Job Preferences:
- Desired Locations: ${preferences.locations?.join(", ") || "Flexible"}
- Remote Preference: ${preferences.remotePreference || "Flexible"}
- Preferred Company Sizes: ${preferences.companySizes?.join(", ") || "Any"}
- Target Role Types: ${[...(preferences.roleTypes || []), ...(preferences.customRoleTypes || [])].join(", ") || "Not specified"}
- Target Industries: ${[...(preferences.industries || []), ...(preferences.customIndustries || [])].join(", ") || "Not specified"}
- Salary Range: $${preferences.salaryRange?.min?.toLocaleString() || 0} - $${preferences.salaryRange?.max?.toLocaleString() || "Open"}
- Work Style Preferences:
  - Pace: ${preferences.workStyle?.pacePreference || "Moderate"}
  - Collaboration: ${preferences.workStyle?.collaborationStyle || "Mixed"}
  - Management: ${preferences.workStyle?.managementPreference || "Supportive"}
  - Growth Priority: ${preferences.workStyle?.growthPriority || "Learning"}
- Dealbreakers: ${preferences.dealbreakers?.join(", ") || "None specified"}
- Additional Notes: ${preferences.additionalNotes || "None"}
` : "";

    const applicationContext = applications?.length > 0 ? `
## Current Application Activity:
- Total applications: ${applications.length}
- Status breakdown: ${Object.entries(
      applications.reduce((acc: any, app: any) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([status, count]) => `${status}: ${count}`).join(", ")}
- Recent applications: ${applications.slice(0, 5).map((app: any) => `${app.position} at ${app.company}`).join("; ")}
` : "";

    const systemPrompt = `You are an expert career coach and strategist with deep knowledge of various industries, job markets, and career development paths. Your role is to analyze the user's background, skills, and preferences to provide personalized, actionable career guidance.

Be encouraging but realistic. Focus on practical steps they can take. Consider both short-term opportunities and long-term career trajectories. If they're missing key skills for their target roles, suggest ways to acquire them.

Format your response with clear sections using markdown headers. Be specific with recommendations - mention actual job titles, companies to target, skills to develop, and concrete action items.`;

    const userPrompt = `Based on the following information about me, please provide a comprehensive career path analysis and recommendations:

${resumeContext}
${preferencesContext}
${applicationContext}

Please provide:
1. **Career Path Analysis** - Based on my background and preferences, what are the most suitable career paths for me? Consider both my current skills and dream job preferences.

2. **Skill Gap Assessment** - What skills or experiences am I missing for my target roles? Be specific about what I should focus on developing.

3. **Recommended Next Steps** - Give me 3-5 specific, actionable steps I should take in the next 30 days to advance my career goals.

4. **Target Companies & Roles** - Based on my preferences and background, suggest 5-10 specific types of companies or actual companies that would be a good fit.

5. **Long-term Strategy** - What should my 1-year and 3-year career development plan look like?

6. **Quick Wins** - What are some immediate opportunities or low-hanging fruit I might be overlooking?

Be specific, actionable, and encouraging. Consider current job market trends and realistic expectations.`;

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
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate career recommendations" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Career pather error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
