# Getting an OpenAI API Key

The app uses OpenAI for the LLM (gpt-4o-mini), TTS (briefing and NPC intros), and Whisper (STT) in the click-to-talk voice flow. You need an API key to run voice features.

## Steps

1. **Sign up or log in**
   - Go to [https://platform.openai.com](https://platform.openai.com)
   - Create an account or sign in

2. **Add payment (if needed)**
   - OpenAI requires a payment method for API usage
   - New accounts may have free credits
   - Billing is pay-as-you-go; usage for voice is typically low

3. **Create an API key**
   - Go to [API keys](https://platform.openai.com/api-keys)
   - Click **Create new secret key**
   - Name it (e.g. "Mothership Companion - local dev")
   - Copy the key immediately (it's only shown once)

4. **Add to `.env.local`**
   ```
   OPENAI_API_KEY=sk-proj-...your-key-here...
   ```

5. **Restart the dev server** after changing env vars.

## Security

- Never commit the key or share it publicly
- Regenerate it from the OpenAI dashboard if it's exposed
- Rotate keys periodically if used in production
