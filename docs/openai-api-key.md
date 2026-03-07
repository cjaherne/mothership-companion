# Getting an OpenAI API Key

The voice agent uses OpenAI for the LLM (or Realtime API) in the STT → LLM → TTS pipeline. You need an API key to run the agent.

## Steps

1. **Sign up or log in**
   - Go to [https://platform.openai.com](https://platform.openai.com)
   - Create an account or sign in

2. **Add payment (if needed)**
   - OpenAI requires a payment method for API usage
   - New accounts may have free credits
   - Billing is pay-as-you-go; usage for the echo agent is typically low

3. **Create an API key**
   - Go to [API keys](https://platform.openai.com/api-keys)
   - Click **Create new secret key**
   - Name it (e.g. "Mothership Companion - local dev")
   - Copy the key immediately (it’s only shown once)

4. **Add to `.env.local`**
   ```
   OPENAI_API_KEY=sk-proj-...your-key-here...
   ```

5. **Restart the agent** after changing env vars.

## LiveKit Cloud

When using LiveKit Cloud for inference, add your OpenAI API key in the project settings:

1. Go to [cloud.livekit.io](https://cloud.livekit.io) → your project
2. Open **Settings** → **API Keys** or **Inference**
3. Add `OPENAI_API_KEY` in the agent environment or linked API keys

The agent also reads `OPENAI_API_KEY` from `.env.local` when running locally.

## Security

- Never commit the key or share it publicly
- Regenerate it from the OpenAI dashboard if it’s exposed
- Rotate keys periodically if used in production
