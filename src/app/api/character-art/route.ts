/**
 * Character artwork generation API
 *
 * Uses Replicate SDXL img2img with Maas reference for Mothership-style portraits.
 */

import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { readFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";

/** Keep top fraction of image height to remove class name label at bottom */
const PORTRAIT_CROP_RATIO = 0.85;

async function cropPortraitToRemoveLabel(buffer: Buffer): Promise<Buffer> {
  const img = sharp(buffer);
  const meta = await img.metadata();
  const width = meta.width ?? 512;
  const height = meta.height ?? 512;
  const cropHeight = Math.floor(height * PORTRAIT_CROP_RATIO);
  return img
    .extract({ left: 0, top: 0, width, height: cropHeight })
    .resize(512, 512)
    .png()
    .toBuffer();
}

const BACKGROUND_COLORS = [
  "solid orange", "solid green", "solid purple", "solid blue", "solid teal",
  "solid crimson", "solid amber", "solid navy", "solid magenta", "solid cyan",
];

const HAIRSTYLES = [
  "buzz cut", "long flowing hair", "short cropped hair", "braids", "mohawk",
  "crew cut", "shaved head", "ponytail", "curly hair", "messy hair",
  "slicked back", "undercut", "buzz cut with fade", "shoulder-length waves",
];

const ACCESSORIES = [
  "glasses", "sunglasses", "scarf", "hood up", "bandana", "goggles",
  "headset", "earpiece", "tactical goggles", "none",
];

const CLOTHING = [
  "hoodie", "flight suit collar", "tactical vest", "high collar", "scarf",
  "crew neck", "zipped jacket", "patched jacket", "military fatigues",
];

const FACIAL_FEATURES = [
  "angular face", "round face", "strong jaw", "soft features", "weathered",
  "youthful", "lined face", "sharp cheekbones", "broad forehead",
];

const VARIABILITY_HINTS = [
  "different gender", "different hairstyle and hair color",
  "different facial expression", "different clothing or uniform style",
  "different age appearance", "different facial structure",
  "different background color", "add glasses or goggles", "add scarf or hood",
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const NEGATIVE_PROMPT =
  "text, words, letters, labels, typography, captions, signage, watermark, logo, written text, class name, " +
  "control panel, monitor frame, display screen, UI elements, control knobs, magenta, glowing display, " +
  "scrambled text, pixelated text, interface, HUD, border frame";

function buildPrompt(
  character: { name: string; traits: string[]; personalitySummary: string },
  variabilityHints?: string[]
): string {
  const traitsStr =
    character.traits?.length > 0 ? character.traits.join(", ") : "sci-fi survivor";
  const bg = pickOne(BACKGROUND_COLORS);
  const hair = pickOne(HAIRSTYLES);
  const acc = pickOne(ACCESSORIES);
  const cloth = pickOne(CLOTHING);
  const face = pickOne(FACIAL_FEATURES);
  const style =
    `Plain portrait only, no text, no labels, no UI, no frame, no control panel. ` +
    `Stylized black and white line art portrait, stippling and fine dots for shading, ` +
    `${bg} background, ${hair}, ${face}, wearing ${cloth}` +
    (acc !== "none" ? `, ${acc}` : "") +
    `, sci-fi character, ${traitsStr}, ${character.personalitySummary}, ` +
    `Mothership RPG, graphic novel style, unique character, shoulders up`;
  if (variabilityHints?.length) {
    return `${style}. Variation: ${variabilityHints.join(", ")}`;
  }
  return style;
}

export async function POST(request: NextRequest) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "REPLICATE_API_TOKEN not configured" },
      { status: 500 }
    );
  }

  let body: {
    character: { name: string; traits: string[]; personalitySummary: string };
    referenceImagePath?: string;
    regenerate?: boolean;
    variabilityHints?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { character, referenceImagePath, regenerate, variabilityHints } = body;
  if (!character?.name) {
    return NextResponse.json(
      { error: "character with name is required" },
      { status: 400 }
    );
  }

  const hints =
    regenerate && variabilityHints?.length
      ? variabilityHints
      : regenerate
        ? pickRandom(VARIABILITY_HINTS, 2)
        : undefined;
  const prompt = buildPrompt(
    {
      name: character.name,
      traits: character.traits ?? [],
      personalitySummary: character.personalitySummary ?? "",
    },
    hints
  );

  let imageData: string;
  const fallbackPath = join(process.cwd(), "public", "images", "npcs", "maas.png");
  const refPath = referenceImagePath
    ? join(process.cwd(), "public", referenceImagePath.replace(/^\//, ""))
    : fallbackPath;
  const isClassReference = referenceImagePath?.includes("classes") ?? false;

  try {
    let buffer: Buffer;
    try {
      buffer = readFileSync(refPath);
    } catch {
      buffer = readFileSync(fallbackPath);
    }
    if (isClassReference) {
      buffer = await cropPortraitToRemoveLabel(buffer);
    }
    imageData = `data:image/png;base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error("Failed to read reference image:", err);
    return NextResponse.json(
      { error: "Reference image not found" },
      { status: 500 }
    );
  }

  try {
    const replicate = new Replicate({ auth: token });
    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          image: imageData,
          prompt,
          negative_prompt: NEGATIVE_PROMPT,
          disable_safety_checker: true,
          prompt_strength: 0.68,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          width: 512,
          height: 512,
        },
      }
    );
    const first = Array.isArray(output) ? output[0] : output;
    let url: string | undefined;
    if (typeof first === "string") {
      url = first;
    } else if (first != null && typeof (first as { url?: () => URL }).url === "function") {
      const urlObj = (first as { url: () => URL }).url();
      url = urlObj instanceof URL ? urlObj.href : String(urlObj);
    } else if (first != null && typeof (first as { toString?: () => string }).toString === "function") {
      url = (first as { toString: () => string }).toString();
    }
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "No image URL in response" },
        { status: 500 }
      );
    }
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Replicate character-art error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    const is401 = msg.includes("401") || msg.toLowerCase().includes("unauthorized");
    const error = is401
      ? "Replicate API token invalid or expired. Check REPLICATE_API_TOKEN in .env.local (create one at replicate.com/account/api-tokens), then restart the dev server."
      : `Image generation failed: ${msg}`;
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}
