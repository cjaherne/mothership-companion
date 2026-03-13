/**
 * Pre-generate static TTS assets for NPC intros and briefing narratives.
 *
 * Run: npm run pregenerate-tts
 * Requires: OPENAI_API_KEY in env (or .env.local)
 *
 * Output:
 *   public/sounds/npcs/{npcId}-intro.mp3
 *   public/sounds/briefing/{pageId}.mp3 (prologue, arrival, overview)
 *   public/sounds/briefing/{locationId}.mp3 (location backgroundText)
 */

import * as fs from "fs";
import * as path from "path";

// Load .env.local (Next.js convention) or .env
const projectRoot = path.resolve(__dirname, "..");
try {
  require("dotenv").config({ path: path.join(projectRoot, ".env.local") });
  require("dotenv").config({ path: path.join(projectRoot, ".env") });
} catch {
  /* dotenv may not be available */
}

const OPENAI_TTS_LIMIT = 4096;
const CHUNK_SIZE = 4000;
const VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
type VoiceOption = (typeof VOICES)[number];

function chunkText(text: string): string[] {
  if (text.length <= OPENAI_TTS_LIMIT) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= CHUNK_SIZE) {
      chunks.push(remaining);
      break;
    }
    const segment = remaining.slice(0, CHUNK_SIZE);
    const lastPeriod = segment.lastIndexOf(". ");
    const lastNewline = segment.lastIndexOf("\n");
    const splitAt = Math.max(lastPeriod, lastNewline, Math.floor(CHUNK_SIZE / 2));
    if (splitAt > 0) {
      chunks.push(remaining.slice(0, splitAt + 1).trim());
      remaining = remaining.slice(splitAt + 1).trim();
    } else {
      chunks.push(segment);
      remaining = remaining.slice(CHUNK_SIZE);
    }
  }
  return chunks;
}

async function generateTts(text: string, voice: VoiceOption, apiKey: string): Promise<Buffer> {
  const chunks = chunkText(text);
  const buffers = await Promise.all(
    chunks.map(async (chunk) => {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          voice,
          input: chunk,
          response_format: "mp3",
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI TTS failed: ${err}`);
      }
      const arrBuf = await res.arrayBuffer();
      return Buffer.from(arrBuf);
    })
  );
  return Buffer.concat(buffers);
}

function getVoiceForNpc(vocalQuality: string | undefined): VoiceOption {
  if (!vocalQuality) return "fable";
  if (vocalQuality.includes("tinny")) return "echo";
  if (vocalQuality.includes("high-pitched") || vocalQuality.includes("squeaky")) return "alloy";
  return "fable";
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is required. Set it in .env.local or your environment.");
    process.exit(1);
  }

  const projectRoot = path.resolve(__dirname, "..");
  const soundsDir = path.join(projectRoot, "public", "sounds");
  const npcsDir = path.join(soundsDir, "npcs");
  const briefingDir = path.join(soundsDir, "briefing");

  for (const dir of [npcsDir, briefingDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created ${path.relative(projectRoot, dir)}`);
    }
  }

  // NPC intros - use dynamic import to avoid pulling in React
  const { distressSignalsNpcs } = await import("../src/campaigns/another-bug-hunt/scenarios/1-distress-signals/npcs");
  const npcIds = Object.keys(distressSignalsNpcs);

  for (const npcId of npcIds) {
    const npc = distressSignalsNpcs[npcId];
    const introText = npc?.introTtsText;
    if (!introText) continue;

    const voice = getVoiceForNpc(npc?.speechProfile?.vocalQuality);
    const outPath = path.join(npcsDir, `${npcId}-intro.mp3`);
    console.log(`Generating NPC intro: ${npcId} (${voice})...`);
    const buffer = await generateTts(introText, voice, apiKey);
    fs.writeFileSync(outPath, buffer);
    console.log(`  -> ${path.relative(projectRoot, outPath)}`);
  }

  // Briefing pages - prologue, arrival, overview
  const { distressSignalsMission } = await import("../src/campaigns/another-bug-hunt/mission");
  const briefingPages = [
    { id: "prologue", page: distressSignalsMission.briefingPages?.find((p) => p.title === "Prologue") },
    { id: "arrival", page: distressSignalsMission.briefingPages?.find((p) => p.title === "Arrival") },
    { id: "overview", page: distressSignalsMission.briefingPages?.find((p) => p.title === "Overview") },
  ];

  for (const { id, page } of briefingPages) {
    if (!page?.content) continue;
    const outPath = path.join(briefingDir, `${id}.mp3`);
    console.log(`Generating briefing: ${id}...`);
    const buffer = await generateTts(page.content, "onyx", apiKey);
    fs.writeFileSync(outPath, buffer);
    console.log(`  -> ${path.relative(projectRoot, outPath)}`);
  }

  // Location backgroundText - Greta Base and other locations with flavour text
  const { anotherBugHuntWorld } = await import("../src/campaigns/another-bug-hunt/world");
  const allLocations = anotherBugHuntWorld.locations;

  for (const loc of allLocations) {
    const bg = loc.backgroundText;
    if (!bg) continue;

    const outPath = path.join(briefingDir, `${loc.id}.mp3`);
    console.log(`Generating location background: ${loc.id}...`);
    const buffer = await generateTts(bg, "onyx", apiKey);
    fs.writeFileSync(outPath, buffer);
    console.log(`  -> ${path.relative(projectRoot, outPath)}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
