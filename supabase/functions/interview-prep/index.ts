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
    const { type, jobDescription, jobTitle, company, masterResume, industry } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "research") {
      systemPrompt = `You are a career research expert. Your task is to provide comprehensive company research to help someone prepare for a job interview. Be specific, actionable, and focus on information that would be valuable in an interview context.`;
      
      userPrompt = `Please research and provide comprehensive information about ${company} for someone preparing for an interview for the role of ${jobTitle}.

Include the following sections:

## Company Overview
Brief description of what the company does, their mission, and core values.

## Recent News & Developments
Key recent developments, product launches, or company news (within the last 1-2 years).

## Company Culture
Insights into the work environment, values in action, and what employees say about working there.

## Industry Position
Their competitive landscape, main competitors, and market position.

## Key Products/Services
Their main offerings and any notable achievements or innovations.

## Interview Talking Points
3-5 specific facts or insights you could reference in the interview to show you've done your research.

${industry ? `Industry context: ${industry}` : ''}
${jobDescription ? `\nJob Description for context:\n${jobDescription}` : ''}

Format the response in clean markdown with headers and bullet points.`;

    } else if (type === "questions") {
      systemPrompt = `You are an expert interview coach with deep experience in technical and behavioral interviewing. Generate realistic, challenging interview questions that are specifically tailored to the role and company. For each question, provide a hint about what the interviewer is really looking for.`;
      
      userPrompt = `Generate practice interview questions for a ${jobTitle} position at ${company}.

Job Description:
${jobDescription || 'No job description provided'}

${industry ? `Industry: ${industry}` : ''}

Please generate questions in the following categories:

1. BEHAVIORAL (4 questions)
Focus on past experiences, teamwork, leadership, conflict resolution, and problem-solving. Use STAR format expectations.

2. TECHNICAL (4 questions)
Role-specific technical questions based on the skills and requirements in the job description.

3. SITUATIONAL (3 questions)
Hypothetical scenarios the candidate might face in this role.

For each question, provide:
- The question itself
- A "hint" explaining what the interviewer is really assessing

Format as JSON array with objects containing: category, question, hint`;

    } else if (type === "coaching") {
      systemPrompt = `You are a seasoned career coach who helps candidates prepare for interviews by identifying their strongest talking points and crafting compelling narratives. You excel at connecting a candidate's experience to what employers are looking for.`;
      
      const resumeContext = masterResume ? `
Candidate's Background:
- Summary: ${masterResume.summary || 'Not provided'}
- Skills: ${masterResume.skills?.join(', ') || 'Not provided'}
- Experience: ${JSON.stringify(masterResume.experience || [])}
- Education: ${JSON.stringify(masterResume.education || [])}
- Certifications: ${masterResume.certifications?.join(', ') || 'Not provided'}
- Projects: ${JSON.stringify(masterResume.projects || [])}` : 'No resume provided - give general coaching tips.';

      userPrompt = `Help this candidate prepare for their ${jobTitle} interview at ${company}.

${resumeContext}

Job Description:
${jobDescription || 'No job description provided'}

${industry ? `Industry: ${industry}` : ''}

Please provide:

1. TOP EXPERIENCES TO HIGHLIGHT (5 items)
Identify specific experiences from their background that best align with this role. For each, explain WHY it's relevant and HOW to frame it.

2. KEY SKILLS TO EMPHASIZE (5 items)
Skills from their background that match the job requirements. Include specific examples of how to demonstrate each.

3. POTENTIAL GAPS TO ADDRESS
Any areas where they might need to proactively address concerns or reframe their experience.

4. QUESTIONS TO ASK THE INTERVIEWER (5 items)
Smart, thoughtful questions that show genuine interest and research about the role and company.

Format the coaching tips as JSON with:
{
  "experiencesToHighlight": [{ "experience": "...", "relevance": "...", "howToFrame": "..." }],
  "skillsToEmphasize": [{ "skill": "...", "example": "..." }],
  "gapsToAddress": [{ "gap": "...", "howToAddress": "..." }],
  "questionsToAsk": ["..."]
}`;

    } else if (type === "all") {
      // Generate everything at once for efficiency
      systemPrompt = `You are a comprehensive interview preparation expert. You will provide company research, practice questions, and personalized coaching tips to help a candidate prepare for their interview.`;
      
      const resumeContext = masterResume ? `
Candidate's Background:
- Summary: ${masterResume.summary || 'Not provided'}
- Skills: ${masterResume.skills?.join(', ') || 'Not provided'}
- Experience: ${JSON.stringify(masterResume.experience || [])}` : '';

      userPrompt = `Prepare comprehensive interview materials for a ${jobTitle} position at ${company}.

${resumeContext}

Job Description:
${jobDescription || 'No job description provided'}

${industry ? `Industry: ${industry}` : ''}

Provide a complete interview prep package in the following JSON format:
{
  "companyResearch": "Markdown formatted company research including overview, culture, recent news, and interview talking points",
  "practiceQuestions": [
    { "category": "behavioral|technical|situational", "question": "...", "hint": "..." }
  ],
  "coachingTips": [
    { "category": "experience|skill|gap", "tip": "..." }
  ],
  "questionsToAsk": ["..."]
}

Include:
- 3-4 behavioral, 3-4 technical, and 2-3 situational practice questions
- 5-8 coaching tips based on the candidate's background
- 4-5 smart questions to ask the interviewer`;

    } else {
      throw new Error(`Invalid type: ${type}. Must be one of: research, questions, coaching, all`);
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
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    return new Response(JSON.stringify({ content, type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Interview prep error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
