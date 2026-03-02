import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { dataSnapshot } = await req.json();

    if (!dataSnapshot) {
      return new Response(JSON.stringify({ error: "Missing dataSnapshot" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a sharp, direct career coach. The user is in "Climb Mode" — employed, focused on internal growth and promotion readiness.

You're writing their WEEKLY brief — a short, punchy situational awareness update. Not a monthly debrief. This is "here's what's happening right now and here's what you should do this week."

Return a JSON response using the tool provided.

Guidelines:
- weeklyBrief: 2-3 sentences, narrative tone. Reference specific numbers (days since last win, overdue contacts, etc). Be provocative — surface the tension. End with a nudge toward action. This should feel like a coach who sees everything and says the uncomfortable thing.
- oneMove: The single most impactful action this week. Specific, concrete, doable in under 30 minutes. Include WHY it matters.
- oneMoveCategory: One of "win_logging", "network", "skill", "visibility", "track_record" — what type of action it is.
- alternateMove: A backup recommendation if the first doesn't resonate. Different category than oneMove.
- alternateMoveCategory: Category for the alternate.
- promotionPulse: One of "heating", "steady", "cooling" — based on win logging frequency and recency. If no wins in 14+ days, it's cooling. If consistent weekly wins, heating. Otherwise steady.
- pulseInsight: 1 sentence explaining the pulse. Reference specific numbers (e.g. "2 wins this month vs your best month's 4").
- networkPriority: Array of up to 3 contacts to reach out to, each with "name", "reason" (why now — be specific, reference days since contact or their role), and "contactId".

If data is sparse, be honest. Don't fabricate urgency, but do surface the cost of inaction.`;

    const userPrompt = `Here is my career data snapshot:

${JSON.stringify(dataSnapshot, null, 2)}

Generate my weekly brief.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_weekly_brief",
              description: "Generate a structured weekly career brief",
              parameters: {
                type: "object",
                properties: {
                  weeklyBrief: { type: "string", description: "2-3 sentence narrative situational awareness" },
                  oneMove: { type: "string", description: "Single highest-leverage action for this week" },
                  oneMoveCategory: { type: "string", enum: ["win_logging", "network", "skill", "visibility", "track_record"] },
                  alternateMove: { type: "string", description: "Backup recommendation" },
                  alternateMoveCategory: { type: "string", enum: ["win_logging", "network", "skill", "visibility", "track_record"] },
                  promotionPulse: { type: "string", enum: ["heating", "steady", "cooling"] },
                  pulseInsight: { type: "string", description: "1 sentence explaining the pulse reading" },
                  networkPriority: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        reason: { type: "string" },
                        contactId: { type: "string" },
                      },
                      required: ["name", "reason", "contactId"],
                    },
                    description: "Up to 3 priority contacts to reach out to",
                  },
                },
                required: ["weeklyBrief", "oneMove", "oneMoveCategory", "alternateMove", "alternateMoveCategory", "promotionPulse", "pulseInsight", "networkPriority"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_weekly_brief" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const briefData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(briefData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weekly-brief error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
