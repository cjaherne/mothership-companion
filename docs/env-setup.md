# Environment Setup

## Security

- **`.env.local`** holds your real API keys (OpenAI, etc.) and **must never be committed**.
- It is listed in `.gitignore` and will not be tracked by git.
- Never run `git add .env.local` or `git add -f .env.local`.

## Setup Steps

1. Copy the template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your keys:
   - `OPENAI_API_KEY` – OpenAI API key (for AI SDK, TTS, and Whisper STT)

3. Restart the dev server after changing env vars.

## If You Accidentally Commit Secrets

If `.env.local` was ever committed:

```bash
git rm --cached .env.local
git commit -m "Remove .env.local from tracking"
```

Rotate all exposed keys immediately in the respective dashboards.
