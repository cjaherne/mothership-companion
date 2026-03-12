import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

/**
 * POST /api/ai/orchestrate
 *
 * AI SDK endpoint for puzzle state, NPC responses, and narrative logic.
 * Consumes game state + player input, returns orchestrated response.
 *
 * This route is the "brain" behind NPC personalities and puzzle gates.
 * Voice agent can call here for text-based logic, or use for hybrid flows.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { messages, gameState, npcProfile } = body;

    const systemPrompt = buildSystemPrompt(gameState, npcProfile);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      messages: messages ?? [],
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("AI orchestrate error:", err);
    return NextResponse.json(
      { error: "AI orchestration failed" },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(
  gameState: Record<string, unknown> | null,
  npcProfile: Record<string, unknown> | null
): string {
  const base = `You are the narrative and puzzle logic engine for a Mothership Warden companion app.
Respond in a way that maintains consistency with the game state and NPC personas.`;

  const stateBlock = gameState
    ? `\n\nCurrent game state: ${JSON.stringify(gameState)}`
    : "";

  const npcBlock = npcProfile
    ? `\n\nActive NPC profile: ${JSON.stringify(npcProfile)}`
    : "";

  return base + stateBlock + npcBlock;
}
