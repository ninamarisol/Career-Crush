import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dataSnapshot, searchContext } = await req.json();
    if (!dataSnapshot || !searchContext) {
      return new Response(JSON.stringify({ error: "Missing data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a sharp, direct job search coach. The user is in active "Crush Mode" — actively searching for a job.

You're writing their WEEKLY brief — a short, punchy situational awareness update. This should feel like a coach who sees everything and says the uncomfortable thing.

Their job search context:
- Stage: ${searchContext.search_stage}
- Target: ${searchContext.target_role}
- Friction: ${searchContext.friction_type}
- Urgency: ${searchContext.urgency}

Return a JSON response using the tool provided.

Guidelines:
- weeklyBrief: 2-3 sentences. Reference specific numbers. Be job-search specific — talk applications, interviews, follow-ups, ghosting. End with an action nudge.
- oneMove: Single most impactful action this week. Concrete, specific, doable. Include WHY.
- oneMoveCategory: One of "applications", "follow_ups", "interview_prep", "networking", "resume" — mapped to the user's friction type.
- alternateMove: Backup recommendation, different category.
- alternateMoveCategory: Category for the alternate.
- momentumLines: Object with keys "applications", "newContacts", "followUps", "interviewPrepHours" — each a short insight sentence about what their current progress number means in context.

Friction type mapping for oneMove priority:
- "resume_not_landing" → prioritize resume/ATS actions
- "getting_ghosted" → prioritize follow-up actions
- "interviews_not_converting" → prioritize interview prep
- "network_inactive" → prioritize networking outreach
- "not_sure_what_looking_for" → prioritize profile refinement`;

    const userPrompt = `Here's my job search data:
${JSON.stringify(dataSnapshot, null, 2)}

Generate my weekly brief.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "generate_crush_brief",
              description: "Generate a structured weekly job search brief",
              parameters: {
                type: "object",
                properties: {
                  weeklyBrief: { type: "string" },
                  oneMove: { type: "string" },
                  oneMoveCategory: { type: "string", enum: ["applications", "follow_ups", "interview_prep", "networking", "resume"] },
                  alternateMove: { type: "string" },
                  alternateMoveCategory: { type: "string", enum: ["applications", "follow_ups", "interview_prep", "networking", "resume"] },
                  momentumLines: {
                    type: "object",
                    properties: {
                      applications: { type: "string" },
                      newContacts: { type: "string" },
                      followUps: { type: "string" },
                      interviewPrepHours: { type: "string" },
                    },
                    required: ["applications", "newContacts", "followUps", "interviewPrepHours"],
                  },
                },
                required: ["weeklyBrief", "oneMove", "oneMoveCategory", "alternateMove", "alternateMoveCategory", "momentumLines"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_crush_brief" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("No structured response");

    const briefData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(briefData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("crush-brief error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
