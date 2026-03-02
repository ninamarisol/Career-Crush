import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { type, progress, goal } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "nudges") {
      systemPrompt = `You are a career coach AI for "Career Crush". Generate exactly 3 short, specific, actionable nudges — one for each pillar: Visibility, Network, Skills. Each nudge should be 1-2 sentences, reference specific data provided, and tell the user exactly what to do next. Be encouraging but direct. Never be generic.`;

      userPrompt = `Here is the user's current monthly progress:

Visibility: ${progress.visibility.completed}/${progress.visibility.total} actions complete. Details: ${JSON.stringify(progress.visibility.actions)}
Network: ${progress.network.completed}/${progress.network.total} check-ins. Details: ${JSON.stringify(progress.network.details)}
Skills: ${progress.skills.completed}/${progress.skills.total} on track. Details: ${JSON.stringify(progress.skills.details)}

Current date context: We are in ${progress.monthName}. ${progress.daysLeft} days left in the month.

Return a JSON object with this exact structure:
{
  "visibility": "nudge text here",
  "network": "nudge text here", 
  "skills": "nudge text here",
  "statusMessage": "A plain-language overall status message like: You're 65% through February. Visibility is lagging — one LinkedIn post this week closes the gap."
}`;
    } else if (type === "custom_goal") {
      systemPrompt = `You are a career coach AI. The user wants to add a custom career goal. Your job is to:
1. Rewrite their goal into a specific, measurable version
2. Generate 3-5 concrete action steps with suggested cadences or due dates
3. Suggest which Career Crush features support this goal

Available features: Track Record (log wins/achievements), Network Health (contacts/check-ins), Skills Development (skill tracking), Goal Crusher (weekly/monthly targets).`;

      userPrompt = `User's goal: "${goal.text}"
Pillar: ${goal.pillar}
Timeframe: ${goal.timeframe || "this month"}

Return a JSON object:
{
  "refinedGoal": "specific measurable version of the goal",
  "steps": [
    { "title": "step description", "cadence": "e.g. 1x/week or by Feb 28", "dueDate": "optional ISO date" }
  ],
  "featureSuggestions": ["e.g. Log this in Track Record when complete"]
}`;
    }

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in AI response");

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("climb-nudges error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
