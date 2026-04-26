# Citizen Pathway

A mobile-first web app that helps lawful permanent residents of the United States study for the USCIS naturalization (civics) test. Features flashcards, voice practice, an AI mock interview, an N-400 form worksheet, and a community wall.

## Stack

- **Frontend** — Vite + React 18, Tailwind CSS, React Router v6, @tanstack/react-query, Framer Motion, shadcn/ui, lucide-react.
- **Backend** — Supabase (Auth, Postgres with RLS, Storage, Edge Functions).
- **AI / Speech** — ElevenLabs TTS and transcription, plus LLM calls (OpenAI / Anthropic / Gemini) through a single `secure-proxy` Edge Function so no API keys ship in the bundle.

## Getting started

Prerequisites: Node 18+ and npm.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in the values:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_PUBLISHABLE_KEY=...
   ```
   The defaults in `.env.example` point at the hosted Citizen Pathway Supabase project, so `npm run dev` works out of the box.
3. Run the app:
   ```bash
   npm run dev
   ```

## Project structure

```
src/
  api/supabaseClient.js    # Supabase client + entity/auth helpers
  components/              # Shared UI components
  lib/                     # Hooks, utilities, auth context
  pages/                   # Top-level routes
supabase/
  functions/secure-proxy/  # Server-side proxy for secret API keys
  migrations/              # SQL schema + RLS policies
```

## Security

- The frontend only ever sees the Supabase **publishable (anon)** key. Row-Level Security enforces per-user access on every table.
- Anything that needs a secret (ElevenLabs, OpenAI, service-role key) lives in the `secure-proxy` Edge Function and is reached via `invokeProxy(action, payload)` from the client.

## License

Proprietary — all rights reserved.
