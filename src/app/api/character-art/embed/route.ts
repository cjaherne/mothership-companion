/**
 * Fetch an image URL and return as base64 data URL for persistent storage.
 * Replicate URLs expire; base64 data URLs stored in localStorage do not.
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = body.url;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  if (!url.startsWith("https://")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Fetch failed: ${res.status}` },
        { status: 502 }
      );
    }
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = res.headers.get("content-type") ?? "image/png";
    const dataUrl = `data:${contentType};base64,${base64}`;
    return NextResponse.json({ dataUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fetch failed" },
      { status: 502 }
    );
  }
}
