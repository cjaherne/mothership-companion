/**
 * Run state API - for agent/orchestration to persist state during play
 *
 * In-memory store (resets on server restart). Client uses localStorage;
 * this API allows the voice agent to update state when wired.
 */

import { NextRequest, NextResponse } from "next/server";
import type { RunState } from "@/types/run";
import { stateStore, clearRunState } from "@/lib/run-state-store";

export async function GET(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get("runId");
  if (!runId) {
    return NextResponse.json({ error: "runId required" }, { status: 400 });
  }
  const state = stateStore.get(runId);
  return NextResponse.json(state ?? null);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { runId, state: statePatch } = body as {
    runId: string;
    state: Partial<RunState>;
  };

  if (!runId || !statePatch) {
    return NextResponse.json(
      { error: "runId and state required" },
      { status: 400 }
    );
  }

  const current = stateStore.get(runId) ?? {
    characters: [],
    exploredLocationIds: [],
    interactedNpcIds: [],
    npcAttributeState: {},
    playerKnowledgeFactIds: [],
    turn: 0,
  };

  const merged: RunState = {
    ...current,
    ...statePatch,
    characters: statePatch.characters ?? current.characters,
    exploredLocationIds:
      statePatch.exploredLocationIds ?? current.exploredLocationIds,
    interactedNpcIds: statePatch.interactedNpcIds ?? current.interactedNpcIds,
    npcAttributeState: {
      ...current.npcAttributeState,
      ...(statePatch.npcAttributeState ?? {}),
    },
    playerKnowledgeFactIds:
      statePatch.playerKnowledgeFactIds ?? current.playerKnowledgeFactIds,
  };

  stateStore.set(runId, merged);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const runId = request.nextUrl.searchParams.get("runId");
  if (!runId) {
    return NextResponse.json({ error: "runId required" }, { status: 400 });
  }
  clearRunState(runId);
  return NextResponse.json({ ok: true });
}
