import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  type: "quick_add" | "star_story";
  content?: string;
  starStructure?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

interface AnalysisResponse {
  entryType?: string;
  suggestedTags: string[];
  potentialQuestions: string[];
  strengthScore: number;
  strengthExplanation: string;
  improvementSuggestion: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content, starStructure }: AnalysisRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let prompt: string;

    if (type === "quick_add" && content) {
      prompt = `Analyze this professional achievement/feedback:

"${content}"

Provide:
1. Entry type: One of "star_story", "feedback_praise", "metric_outcome", or "project_highlight"
2. 3-5 relevant skill tags (e.g., Leadership, Data Analysis, Stakeholder Management)
3. 5-8 common interview questions this could help answer
4. Strength score (1-10) with brief explanation
5. One specific suggestion to make this stronger

Return as JSON:
{
  "entryType": string,
  "suggestedTags": array of strings,
  "potentialQuestions": array of strings,
  "strengthScore": number,
  "strengthExplanation": string,
  "improvementSuggestion": string
}`;
    } else if (type === "star_story" && starStructure) {
      prompt = `Analyze this STAR story:

Situation: ${starStructure.situation}
Task: ${starStructure.task}
Action: ${starStructure.action}
Result: ${starStructure.result}

Evaluate:
1. Which skills/competencies does this demonstrate? (5-7 tags)
2. What interview questions could this answer? (8-12 questions)
3. Strength score (1-10) based on:
   - Specificity of Situation/Task
   - Clarity of Action taken
   - Measurability of Result
4. What's missing or could be improved?

Return as JSON:
{
  "suggestedTags": array of strings,
  "potentialQuestions": array of strings,
  "strengthScore": number,
  "strengthExplanation": string,
  "improvementSuggestion": string
}`;
    } else {
      throw new Error("Invalid request type or missing content");
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
          {
            role: "system",
            content: "You are a career coaching expert who helps professionals document their achievements and prepare for interviews. Always respond with valid JSON only, no markdown formatting.",
          },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_track_record",
              description: "Return the analysis of a track record entry",
              parameters: {
                type: "object",
                properties: {
                  entryType: { 
                    type: "string", 
                    enum: ["star_story", "feedback_praise", "metric_outcome", "project_highlight"],
                    description: "The type of entry (only for quick_add)"
                  },
                  suggestedTags: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-7 relevant skill tags"
                  },
                  potentialQuestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-12 interview questions this could answer"
                  },
                  strengthScore: {
                    type: "number",
                    description: "Score from 1-10"
                  },
                  strengthExplanation: {
                    type: "string",
                    description: "Brief explanation of the score"
                  },
                  improvementSuggestion: {
                    type: "string",
                    description: "One specific suggestion to improve"
                  }
                },
                required: ["suggestedTags", "potentialQuestions", "strengthScore", "strengthExplanation", "improvementSuggestion"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_track_record" } }
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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI Response:", JSON.stringify(aiResponse, null, 2));

    // Extract the tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const analysis: AnalysisResponse = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse content directly
    const content_response = aiResponse.choices?.[0]?.message?.content;
    if (content_response) {
      const cleanedContent = content_response.replace(/```json\n?|\n?```/g, '').trim();
      const analysis: AnalysisResponse = JSON.parse(cleanedContent);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unable to parse AI response");

  } catch (error) {
    console.error("analyze-track-record error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
