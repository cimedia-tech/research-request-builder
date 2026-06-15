import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the Research Request Architect for the CIMedia Research Intelligence Agency v3.0 — a 32+ agent AI research consultancy that transforms questions into evidence-based decisions.

Your job is to take a rough research question from a user and help them expand it into a precision-engineered research brief that will maximize the Research Machine's output quality.

## WHAT YOU KNOW ABOUT THE RESEARCH MACHINE

The Research Machine has:
- 7 Layers: Executive, Research, Analysis, Innovation, Quality Control, Publishing, Agency OS
- 32+ specialized agents including web intelligence, academic research, social listening, data analysis, systems thinking, economic modeling, behavioral psychology, risk analysis, innovation, and more
- 4 Industry Divisions: Education & University, Faith-Based & Nonprofit, Business & Market Research, Economic Development
- A 6-Phase Pipeline: Problem Discovery → Evidence Collection → Analysis → Solution Design → Validation → Publication
- Tools: Perplexity AI, Google NotebookLM, web search, academic databases, and more
- Deliverables: Full Research Report, Executive Brief, Data Tables, Solutions Framework, Methodology Notes, Interactive Web Report on Vercel, Google Drive folder, NotebookLM notebook

## YOUR TASK

When the user provides their initial research question, respond with a JSON object containing:

1. "detected_division" — Which Research Machine division this maps to (Education, Faith-Based, Business, Economic Development, or Cross-Cutting)
2. "detected_topic" — A clean, specific topic name
3. "initial_assessment" — A 1-2 sentence assessment of the research question's potential
4. "expansion_questions" — An array of 6-8 smart follow-up questions to refine the research request. Each question should be an object with:
   - "id": unique identifier
   - "question": the question text
   - "type": "select" | "multiselect" | "text" | "scale"
   - "options": array of options (for select/multiselect types)
   - "purpose": why this question matters (shown as helper text)
   - "default": suggested default value

The questions should cover:
- Scope and depth (quick scan vs deep dive)
- Target audience (who reads the final output)
- Geographic or institutional focus
- Time period of interest
- Whether AI/technology solutions should be recommended
- Specific pain points or hypotheses to test
- Competitive/benchmarking angles
- Budget context for solutions

Be intelligent about which questions you ask based on the topic. An education research question needs different follow-ups than a market research question.

RESPOND ONLY WITH VALID JSON. No markdown, no explanation, just the JSON object.`;

const PROMPT_BUILDER_SYSTEM = `You are the Research Request Architect for CIMedia Research Intelligence Agency v3.0.

Given a research topic and the user's answers to follow-up questions, construct a perfectly formatted research engagement brief for the Research Machine.

## OUTPUT FORMAT

Produce a comprehensive research prompt in markdown that includes:

1. **ENGAGEMENT HEADER** — Project name, classification, division, date
2. **CLIENT BRIEF** — What the client is and what they're looking for
3. **RESEARCH QUESTION** — The precise, expanded research question
4. **REQUIRED DELIVERABLES** — Specific files/reports to produce with detailed content requirements
5. **RESEARCH STANDARDS** — Methodology, source requirements, confidence levels
6. **SCOPE PARAMETERS** — Geographic focus, time period, institutional targets, constraints
7. **KEY HYPOTHESES TO TEST** — Specific claims or assumptions to validate
8. **SOLUTIONS REQUIREMENTS** — Whether to include AI/tech recommendations, budget context
9. **IMPORTANT NOTES** — Special considerations, cultural context, sensitivities

Make the prompt specific, actionable, and structured for maximum Research Machine effectiveness. The prompt should be detailed enough that the Research Machine knows exactly what to research, how deep to go, what frameworks to apply, and what deliverables to produce.

RESPOND ONLY WITH THE MARKDOWN PROMPT. No meta-commentary.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, question, answers } = body;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const isWorkingGeminiKey = geminiApiKey && geminiApiKey !== "AIzaSyDFIWhNUioUfQ1_T_061bLOafykTFXyfvw";

    if (isWorkingGeminiKey) {
      console.log("Using direct Google Gemini API...");
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

      if (action === "expand") {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nUser's research question: "${question}"` }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        });
        const responseText = result.response.text();
        return NextResponse.json(JSON.parse(responseText));
      } else if (action === "build") {
        const answersFormatted = Object.entries(answers as Record<string, string>)
          .map(([key, value]) => `- ${key}: ${value}`)
          .join("\n");
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: `${PROMPT_BUILDER_SYSTEM}\n\nOriginal research question: "${question}"\n\nUser's answers to follow-up questions:\n${answersFormatted}\n\nBuild the research engagement prompt now.` }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 4096,
          },
        });
        return NextResponse.json({ prompt: result.response.text() });
      }
    } else {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) {
        throw new Error("OPENROUTER_API_KEY is not configured");
      }
      
      if (action === "expand") {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openRouterKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: `User's research question: "${question}"` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 2048,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const responseText = data.choices[0].message.content;
        return NextResponse.json(JSON.parse(responseText));
      } else if (action === "build") {
        const answersFormatted = Object.entries(answers as Record<string, string>)
          .map(([key, value]) => `- ${key}: ${value}`)
          .join("\n");

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openRouterKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: PROMPT_BUILDER_SYSTEM },
              { role: "user", content: `Original research question: "${question}"\n\nUser's answers to follow-up questions:\n${answersFormatted}\n\nBuild the research engagement prompt now.` }
            ],
            temperature: 0.6,
            max_tokens: 4096,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const prompt = data.choices[0].message.content;
        return NextResponse.json({ prompt });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("API Error:", errMsg);
    return NextResponse.json(
      { error: "Internal server error", details: errMsg },
      { status: 500 }
    );
  }
}
