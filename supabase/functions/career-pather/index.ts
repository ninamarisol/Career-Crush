import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { resume, preferences, applications, mode, targetGoal, constraints } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const currentRole = resume?.experience?.[0]?.title || "Job Seeker";
    const currentCompany = resume?.experience?.[0]?.company || "";
    const yearsOfExperience = resume?.experience?.length || 0;
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

    const constraintsContext = constraints ? `
## User Constraints:
${constraints.locationLocked ? `- Location locked: Cannot relocate from ${constraints.location || "current location"}` : ""}
${constraints.minSalary ? `- Minimum salary requirement: $${constraints.minSalary.toLocaleString()}` : ""}
${constraints.familyObligations ? `- Has family obligations affecting flexibility` : ""}
${constraints.noMBA ? `- Cannot pursue MBA (budget or time constraint)` : ""}
${constraints.otherConstraints ? `- Other: ${constraints.otherConstraints}` : ""}
` : "";

    const isGoalOriented = mode === "goal-oriented" && targetGoal;

    const systemPrompt = isGoalOriented
      ? `You are an expert career strategist. A user has specified a SPECIFIC career goal. Your job is to reverse-engineer the most efficient path from their current position to that goal.

TASK: Analyze this person's background and create a detailed roadmap to reach their specified target role/goal. If the goal seems unrealistic given their background, say so honestly but still provide the path while noting the challenges.

CRITICAL: Return ONLY valid JSON matching this exact schema. No markdown, no explanations, just pure JSON:

{
  "mode": "goal-oriented",
  "currentRole": "string",
  "currentCompensation": number,
  "yearsOfExperience": number,
  "targetGoal": "string - the user's stated goal",
  "feasibilityScore": number (0-100, how realistic this goal is),
  "feasibilityNote": "string - honest assessment. Flag if unrealistic, e.g. 'Becoming a surgeon requires 11+ years of training' or 'This is very achievable within 2 years'",
  "primaryPath": {
    "id": "primary",
    "name": "string - descriptive name for this path",
    "icon": "🎯",
    "targetRole": "string",
    "targetCompany": "string - type of company to target",
    "timeline": "string - e.g. '18-24 months'",
    "compensation": {
      "current": number,
      "target": number,
      "increase": number,
      "percentIncrease": number
    },
    "successProbability": number (0-100),
    "difficulty": "Low" | "Medium" | "Medium-High" | "High" | "Very High",
    "gapAnalysis": {
      "strengths": ["what user already has going for them"],
      "gaps": ["specific gaps like '2 years analytics experience needed'", "MBA recommended for this path"],
      "effortLevel": "Low" | "Medium" | "High" | "Very High"
    },
    "roadmap": {
      "milestones": [
        {
          "id": "m1",
          "order": 1,
          "title": "string",
          "duration": "Months 1-6",
          "targetRoles": ["job titles to pursue at this stage"],
          "companiesTargeted": ["specific companies or types"],
          "objectives": ["specific actions"],
          "skillsToAcquire": ["skills needed"],
          "resources": ["courses, books, communities"],
          "successMetrics": ["how to know you've completed this"],
          "avgTimeToComplete": "string",
          "completed": false,
          "progress": 0
        }
      ]
    },
    "actionItems": {
      "immediate": ["things to do this week"],
      "shortTerm": ["things to do in next 3 months"],
      "longTerm": ["things to do in 6-12 months"]
    }
  },
  "alternativePaths": [
    {
      "id": "alt1",
      "name": "string - e.g. 'Non-MBA path to consulting'",
      "icon": "🔄",
      "description": "string - when to use this alternative",
      "timeline": "string",
      "keyDifference": "string - what makes this different from primary",
      "tradeoffs": ["what you give up", "what you gain"],
      "roadmap": {
        "milestones": [
          {
            "id": "a1",
            "order": 1,
            "title": "string",
            "duration": "string",
            "objectives": ["specific actions"],
            "skillsToAcquire": ["skills"],
            "resources": ["resources"],
            "successMetrics": ["metrics"],
            "completed": false,
            "progress": 0
          }
        ]
      }
    }
  ],
  "reasoning": "string - overall strategic reasoning"
}

REQUIREMENTS:
- Primary path should have 3-5 milestones with SPECIFIC role titles, companies, and timelines
- Include 1-2 alternative paths if primary has blockers (e.g. non-MBA path, non-traditional path)
- Action items should be CONCRETE: "Build SQL skills via Mode Analytics free course" not "Learn data"
- Flag unrealistic goals honestly but respectfully
- Adjust for any constraints the user has specified
- Include real company names and real resources (courses, books, communities)`

      : `You are an expert career strategist who analyzes career trajectories and suggests realistic next moves.

TASK: Analyze this person's background and generate 3-5 DISTINCT career paths they could realistically pursue. Each path should represent a meaningfully different career direction. Highlight where their current experience gives them advantages.

CRITICAL: Return ONLY valid JSON matching this exact schema. No markdown, no explanations, just pure JSON:

{
  "mode": "exploratory",
  "currentRole": "string",
  "currentCompensation": number,
  "yearsOfExperience": number,
  "paths": [
    {
      "id": "string",
      "name": "string - descriptive path name",
      "icon": "emoji",
      "targetRole": "string - realistic next role",
      "targetCompany": "string - type of company",
      "timeline": "string - e.g. '12-18 months'",
      "compensation": {
        "current": number,
        "target": number,
        "increase": number,
        "percentIncrease": number
      },
      "successProbability": number (0-100),
      "difficulty": "Low" | "Medium" | "Medium-High" | "High" | "Very High",
      "whyThisPath": "string - why this path makes sense given their background",
      "existingAdvantages": ["what they already have that helps"],
      "appeal": {
        "bestFor": ["type of person this suits"],
        "benefits": ["key benefits"],
        "tradeoffs": ["key tradeoffs"]
      },
      "nextSteps": ["3-5 concrete immediate actions"],
      "roadmap": {
        "milestones": [
          {
            "id": "m1",
            "order": 1,
            "title": "string",
            "duration": "string",
            "targetRoles": ["job titles at this stage"],
            "companiesTargeted": ["companies or types"],
            "objectives": ["specific actions"],
            "skillsToAcquire": ["skills"],
            "resources": ["real courses, books, communities"],
            "successMetrics": ["how to know you've completed this"],
            "completed": false,
            "progress": 0
          }
        ]
      },
      "gapAnalysis": {
        "strengths": ["existing strengths"],
        "gaps": ["what needs building"],
        "effortLevel": "Low" | "Medium" | "High" | "Very High"
      },
      "marketContext": {
        "demandScore": number (0-100),
        "hiringTrends": "string",
        "topCompanies": ["real company names"]
      }
    }
  ],
  "recommendedPath": "string - id of recommended path",
  "reasoning": "string - why this path is recommended"
}

REQUIREMENTS:
- Generate 3-5 paths (fewer if the person's background is narrow)
- Each path must be MEANINGFULLY DIFFERENT (not just variations)
- Highlight existing advantages for each path
- Success probabilities should be realistic (60-90%)
- Include REAL company names, resources, and courses
- Action items should be specific: "Complete Google Analytics cert" not "Learn analytics"
- Each path should have 2-4 milestones
- Adjust recommendations based on any constraints`;

    const userPrompt = `Based on this person's profile, generate career paths:

${resumeContext}
${preferencesContext}
${constraintsContext}
${isGoalOriented ? `
## SPECIFIC GOAL:
The user wants to reach: "${targetGoal}"
Reverse-engineer the path to this goal. Be honest about feasibility.
` : ""}

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
