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
    const currentRole = resume?.experience?.[0]?.title || "Job Seeker";
    const currentCompany = resume?.experience?.[0]?.company || "";
    const yearsOfExperience = resume?.experience?.length || 0;
    
    // Estimate current compensation (or use placeholder)
    const estimatedComp = preferences?.salaryRange?.min || 80000;

    const resumeContext = resume ? `
## User's Current Profile:
- Current Role: ${currentRole}${currentCompany ? ` at ${currentCompany}` : ""}
- Years of Experience: ${yearsOfExperience}+ years
- Summary: ${resume.summary || "Not provided"}
- Skills: ${resume.skills?.join(", ") || "Not provided"}
- Experience History: ${resume.experience?.map((exp: any) => `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.current ? "Present" : exp.endDate}): ${exp.description || "No description"}`).join("; ") || "Not provided"}
- Education: ${resume.education?.map((edu: any) => `${edu.degree} from ${edu.school} (${edu.graduationDate})`).join("; ") || "Not provided"}
- Projects: ${resume.projects?.map((p: any) => `${p.name}: ${p.description}`).join("; ") || "Not provided"}
- Certifications: ${resume.certifications?.join(", ") || "Not provided"}
- Estimated Current Compensation: $${estimatedComp.toLocaleString()}
` : "";

    const preferencesContext = preferences ? `
## User's Interests & Preferences:
- Preferred Roles: ${[...(preferences.roleTypes || []), ...(preferences.customRoleTypes || [])].join(", ") || "Open to options"}
- Target Industries: ${[...(preferences.industries || []), ...(preferences.customIndustries || [])].join(", ") || "Open to options"}
- Desired Locations: ${preferences.locations?.join(", ") || "Flexible"}
- Company Size Preference: ${preferences.companySizes?.join(", ") || "Any size"}
- Salary Expectations: $${preferences.salaryRange?.min?.toLocaleString() || 0} - $${preferences.salaryRange?.max?.toLocaleString() || "Open"}
` : "";

    const applicationContext = applications?.length > 0 ? `
## Current Job Search Activity:
- Total applications: ${applications.length}
- Status breakdown: ${Object.entries(
      applications.reduce((acc: any, app: any) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([status, count]) => `${status}: ${count}`).join(", ")}
` : "";

    const systemPrompt = `You are an expert career strategist who analyzes career trajectories and suggests realistic next moves.

TASK: Analyze this person's background and generate 5 DISTINCT career trajectories they could realistically pursue. Each trajectory should represent a meaningfully different career direction.

CRITICAL: Return ONLY valid JSON matching this exact schema. No markdown, no explanations, just pure JSON:

{
  "currentRole": "string - their current/most recent role",
  "currentCompensation": number,
  "yearsOfExperience": number,
  "trajectories": [
    {
      "id": "rocketship",
      "name": "The Rocketship",
      "icon": "🚀",
      "targetRole": "Senior Product Manager",
      "targetCompany": "High-growth startup (Series B-C)",
      "timeline": "12-18 months",
      "compensation": {
        "current": 145000,
        "target": 200000,
        "increase": 55000,
        "percentIncrease": 38
      },
      "successProbability": 78,
      "difficulty": "Medium-High",
      "appeal": {
        "bestFor": ["Fast growth seekers", "Risk tolerant", "Generalists"],
        "benefits": ["Rapid career advancement", "Higher compensation", "Learning opportunities"],
        "tradeoffs": ["Higher risk", "Fast pace", "Less stability"]
      },
      "roadmap": {
        "milestones": [
          {
            "id": "m1",
            "order": 1,
            "title": "Build Foundation",
            "duration": "Months 1-4",
            "objectives": ["Complete growth course", "Network with 5 senior PMs"],
            "skillsToAcquire": ["Growth metrics", "A/B testing"],
            "resources": ["Reforge Growth Series", "Product School"],
            "successMetrics": ["Certificate earned", "Contacts made"],
            "completed": false,
            "progress": 0
          }
        ]
      },
      "gaps": {
        "strengths": ["Strong product foundation", "Communication skills"],
        "needsToBuild": ["Growth expertise", "Startup experience"],
        "effortLevel": "High"
      },
      "marketContext": {
        "demandScore": 85,
        "hiringTrends": "Strong demand for growth PMs",
        "competitiveLandscape": "Competitive but achievable",
        "topCompanies": ["Notion", "Linear", "Figma"]
      }
    }
  ],
  "recommendedPath": "rocketship",
  "reasoning": "Based on your skills and trajectory, this path offers the best combination of growth and probability of success."
}

TRAJECTORY TYPES TO INCLUDE (adapt names/icons based on the person's field):
1. "The Rocketship" 🚀 - Fast track to senior role at high-growth company
2. "The Specialist" 🎯 - Deep expertise in a hot domain (AI, Growth, etc.)
3. "The Leader" 💼 - People management track
4. "The Strategist" 🌟 - Consulting/strategy pivot
5. "The Safe Bet" 🛡️ - Steady promotion at current company type

REQUIREMENTS:
- Each trajectory must have 3-4 specific milestones
- Success probabilities should be realistic (60-90% range)
- Compensation increases should be data-driven (20-60% typical for role changes)
- Include real company names and resources
- Make trajectories MEANINGFULLY DIFFERENT, not just variations`;

    const userPrompt = `Based on this person's profile, generate 5 career trajectories:

${resumeContext}
${preferencesContext}
${applicationContext}

Generate trajectories that are:
- Realistic given their background
- Distinct from each other (different directions, not just variations)
- Ranked by probability of success
- Include specific timelines, compensation changes, and actionable milestones

Remember: Return ONLY valid JSON, no other text.`;

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
