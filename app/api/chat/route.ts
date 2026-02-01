// import { streamText, convertToModelMessages } from "ai";
// import { google } from "@ai-sdk/google";

// export async function POST(req: Request) {
//   const { messages, designContext } = await req.json();

//   const systemPrompt = `You are DesignLens AI, an expert UI/UX design assistant. You analyze designs and provide actionable feedback to help designers create better user interfaces.

// Your expertise includes:
// - Color theory and accessibility (WCAG guidelines)
// - Typography best practices (hierarchy, readability, font pairing)
// - Layout and spacing principles (alignment, whitespace, visual balance)
// - Accessibility standards (contrast ratios, touch targets, screen reader compatibility)
// - Modern design trends and patterns

// When analyzing designs, you:
// 1. Identify specific issues with precise details
// 2. Explain WHY something is a problem (impact on users)
// 3. Provide concrete suggestions for improvement
// 4. Prioritize issues by severity (critical, warning, suggestion)

// Current Design Context:
// ${designContext || "No design elements on canvas yet."}

// Be concise, specific, and actionable in your responses. Use bullet points for multiple suggestions. Always be encouraging while pointing out areas for improvement.`;

//   const result = streamText({
//     model: google("gemini-2.5-flash"),
//     system: systemPrompt,
//     messages: await convertToModelMessages(messages),
//   });

//   return result.toUIMessageStreamResponse();
// }
import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  const { messages, designContext } = await req.json();

  const systemPrompt = `You are DesignLens AI, an expert UI/UX design assistant. You analyze designs and provide actionable feedback to help designers create better user interfaces.

Your expertise includes:
- Color theory and accessibility (WCAG guidelines)
- Typography best practices (hierarchy, readability, font pairing)
- Layout and spacing principles (alignment, whitespace, visual balance)
- Accessibility standards (contrast ratios, touch targets, screen reader compatibility)
- Modern design trends and patterns

When analyzing designs, you:
1. Identify specific issues with precise details
2. Explain WHY something is a problem (impact on users)
3. Provide concrete suggestions for improvement
4. Prioritize issues by severity (critical, warning, suggestion)

Current Design Context:
${designContext || "No design elements on canvas yet."}

Be concise, specific, and actionable in your responses. Use bullet points for multiple suggestions. Always be encouraging while pointing out areas for improvement.`;

  try {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Check for rate limit error
    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
      return Response.json(
        { error: "RATE_LIMIT", message: "Gemini API rate limit exceeded. Please wait a moment and try again, or use the local analyzer." },
        { status: 429 }
      );
    }
    
    return Response.json(
      { error: "API_ERROR", message: errorMessage },
      { status: 500 }
    );
  }
}

