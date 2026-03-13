# Sounds

## Dice Roll

Place a dice-rolling sound effect at `public/sounds/dice-roll.mp3` for the interactive dice roller. The app will work without it; it simply won't play sound when rolling.

## Pre-Generated TTS

Run `npm run pregenerate-tts` to generate static MP3s for faster playback:

- **NPC intros:** `public/sounds/npcs/{npcId}-intro.mp3` (e.g. `maas-intro.mp3`)
- **Briefing pages:** `public/sounds/briefing/{pageId}.mp3` (prologue, arrival, overview)
- **Location backgrounds:** `public/sounds/briefing/{locationId}.mp3` (e.g. `outside-airlock.mp3`, `commissary.mp3`)

Requires `OPENAI_API_KEY`. If pre-generated files are missing, the app falls back to the TTS API.
