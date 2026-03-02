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
    // Auth check
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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
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

    const systemPrompt = `You are an elite executive career coach conducting a monthly career debrief for a professional who is in "Climb Mode" — they are currently employed and focused on career growth, not actively job searching.

Your job is to synthesize their raw activity data from the last 30 days into an insightful, narrative-driven briefing. Be direct, specific, and actionable. Avoid generic advice — every insight must be grounded in the data provided.

You must return a JSON response using the tool provided. The briefing should feel like a conversation with a sharp, experienced coach who knows the user's data cold.

Guidelines:
- retrospective: 2-3 sentences summarizing the month. Reference specific numbers.
- stats: Array of 3 key metrics with label and value (e.g. "Applications" → "12").
- patterns: 2-3 data-driven observations. Each should reference specific numbers or trends.
- blindSpots: 1-2 things the user likely isn't seeing. Be provocative but constructive.
- oneMove: A single, specific, high-leverage action for next month. Bold and clear.
- supportingActions: 2-3 concrete steps that support the one move.

If data is sparse, acknowledge it honestly and recommend the most impactful first steps.`;

    const userPrompt = `Here is my career data snapshot for the last 30 days:

${JSON.stringify(dataSnapshot, null, 2)}

Generate my monthly career briefing.`;

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
              name: "generate_career_briefing",
              description: "Generate a structured monthly career briefing",
              parameters: {
                type: "object",
                properties: {
                  retrospective: { type: "string", description: "2-3 sentence narrative summary of the last 30 days" },
                  stats: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        label: { type: "string" },
                        value: { type: "string" },
                      },
                      required: ["label", "value"],
                    },
                    description: "3 key metrics",
                  },
                  patterns: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 data-driven pattern observations",
                  },
                  blindSpots: {
                    type: "array",
                    items: { type: "string" },
                    description: "1-2 things the user might not be seeing",
                  },
                  oneMove: { type: "string", description: "Single highest-leverage action for next month" },
                  supportingActions: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 concrete steps supporting the one move",
                  },
                },
                required: ["retrospective", "stats", "patterns", "blindSpots", "oneMove", "supportingActions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_career_briefing" } },
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

    const briefingData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(briefingData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("career-briefing error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
