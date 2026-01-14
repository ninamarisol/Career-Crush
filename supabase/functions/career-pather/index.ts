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

    const resumeContext = resume ? `
## User's Background (Master Resume):
- Current Role: ${currentRole}${currentCompany ? ` at ${currentCompany}` : ""}
- Years of Experience: ${yearsOfExperience}+ years
- Summary: ${resume.summary || "Not provided"}
- Skills: ${resume.skills?.join(", ") || "Not provided"}
- Experience: ${resume.experience?.map((exp: any) => `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.current ? "Present" : exp.endDate}): ${exp.description || "No description"}`).join("; ") || "Not provided"}
- Education: ${resume.education?.map((edu: any) => `${edu.degree} from ${edu.school} (${edu.graduationDate})`).join("; ") || "Not provided"}
- Projects: ${resume.projects?.map((p: any) => `${p.name}: ${p.description}`).join("; ") || "Not provided"}
- Certifications: ${resume.certifications?.join(", ") || "Not provided"}
` : "";

    const targetRoles = preferences?.roleTypes?.length > 0 
      ? [...(preferences.roleTypes || []), ...(preferences.customRoleTypes || [])].join(", ")
      : "Not specified";
    
    const targetCompanies = preferences?.companySizes?.length > 0
      ? preferences.companySizes.map((s: string) => {
          const sizeMap: Record<string, string> = {
            startup: "Startups (1-50)",
            small: "Small companies (51-200)",
            medium: "Medium companies (201-1000)",
            large: "Large companies (1001-5000)",
            enterprise: "Enterprise (5000+)"
          };
          return sizeMap[s] || s;
        }).join(", ")
      : "Any size";

    const preferencesContext = preferences ? `
## User's Dream Job:
- Target Roles: ${targetRoles}
- Target Industries: ${[...(preferences.industries || []), ...(preferences.customIndustries || [])].join(", ") || "Not specified"}
- Desired Locations: ${preferences.locations?.join(", ") || "Flexible"}
- Remote Preference: ${preferences.remotePreference || "Flexible"}
- Company Size Preference: ${targetCompanies}
- Salary Range: $${preferences.salaryRange?.min?.toLocaleString() || 0} - $${preferences.salaryRange?.max?.toLocaleString() || "Open"}
- Work Style:
  - Pace: ${preferences.workStyle?.pacePreference || "Moderate"}
  - Collaboration: ${preferences.workStyle?.collaborationStyle || "Mixed"}
  - Management: ${preferences.workStyle?.managementPreference || "Supportive"}
  - Growth Priority: ${preferences.workStyle?.growthPriority || "Learning"}
- Dealbreakers: ${preferences.dealbreakers?.join(", ") || "None specified"}
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

    const systemPrompt = `You are an expert career coach and strategist. You analyze career trajectories and create personalized, actionable career roadmaps.

Your job is to analyze the user's current position vs their dream job and create a detailed career path with specific milestones.

CRITICAL: You MUST return ONLY valid JSON matching this exact schema. No markdown, no explanations, just pure JSON:

{
  "targetRole": "string - the dream job title",
  "targetCompanies": ["array of 3-5 specific company names to target"],
  "currentRole": "string - current or most recent role",
  "estimatedDuration": "string like '18-24 months'",
  "gapAnalysis": {
    "experienceGap": {
      "current": number,
      "required": number,
      "gap": number,
      "strategy": "string - how to close the gap"
    },
    "skillGaps": [
      {
        "skill": "string",
        "priority": "Critical" | "High" | "Medium" | "Nice-to-Have",
        "currentLevel": "None" | "Beginner" | "Intermediate" | "Advanced",
        "requiredLevel": "Intermediate" | "Advanced" | "Expert",
        "timeToAcquire": "string like '2-3 months'",
        "resources": ["array of specific resources"]
      }
    ],
    "credentialGaps": [
      {
        "credential": "string",
        "required": boolean,
        "timeToComplete": "string",
        "cost": "string",
        "roi": "string"
      }
    ],
    "networkGaps": {
      "targetConnections": ["types of people to connect with"],
      "currentConnections": 0,
      "strategies": ["networking strategies"]
    }
  },
  "milestones": [
    {
      "id": "m1",
      "order": 1,
      "title": "string - milestone name like 'Build Foundation'",
      "role": "string - role during this phase",
      "duration": "string like 'Months 1-6'",
      "objectives": ["specific tasks to complete"],
      "skillsToAcquire": ["skills"],
      "projectsToLead": ["project ideas"],
      "companiesTargeted": ["company names if applicable"],
      "successCriteria": ["how to know you've completed this"],
      "completed": false,
      "progress": 0
    }
  ],
  "actionPlan": {
    "immediate": [
      {
        "action": "string - specific action",
        "category": "Learning" | "Networking" | "Experience" | "Credibility",
        "estimatedTime": "string",
        "priority": 1,
        "resources": ["links or names"]
      }
    ],
    "shortTerm": [
      {
        "action": "string",
        "category": "string",
        "quarter": "Q1" | "Q2" | "Q3" | "Q4",
        "dependencies": ["what needs to happen first"]
      }
    ],
    "longTerm": [
      {
        "action": "string",
        "milestone": "string - which milestone this belongs to",
        "estimatedCompletion": "string"
      }
    ]
  },
  "resources": {
    "courses": [
      {
        "title": "string",
        "provider": "string",
        "url": "string or empty",
        "cost": "string",
        "duration": "string",
        "priority": "Must" | "Should" | "Could"
      }
    ],
    "books": [
      {
        "title": "string",
        "author": "string",
        "why": "string - why this book helps"
      }
    ],
    "communities": ["community names"],
    "mentors": ["types of mentors to seek"],
    "companies": ["specific companies to target"]
  },
  "risks": {
    "commonPitfalls": ["things to avoid"],
    "howToAvoid": ["prevention strategies"],
    "warningSignsOffTrack": ["signs you're falling behind"]
  }
}

Create 3-5 milestones that form a realistic path from current position to dream job. Be specific with company names, course names, and actionable steps. Base recommendations on real market requirements.`;

    const userPrompt = `Based on this information, create a personalized career roadmap:

${resumeContext}
${preferencesContext}
${applicationContext}

Generate a complete career path JSON following the exact schema. Include:
- 3-5 realistic milestones
- Specific skill gaps with real courses/certifications
- Real company names to target
- Actionable next steps for the next 30 days
- Long-term strategy aligned with their goals

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
