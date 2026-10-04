# Perth Hospital Bed Guide API

Small Vercel serverless endpoint for the private family Bed Guide tool.

- POST `/api/ask` with JSON: `{"question":"...","context":"..."}`
- OpenRouter free router is primary.
- Kilo Auto Free is fallback.
- Built-in research-based answers are the final fallback.
- Provider credentials are stored only as Vercel environment variables.
