# MediPredict Frontend

Lightweight single-page experience for MediPredict, featuring Firebase Authentication/Firestore history streaming and a multimodal prediction simulator backed by Google Gemini.

## Local development

1. Duplicate `env.sample` to `.env` (or configure environment variables directly in Vercel) and populate the Firebase + Gemini values.
2. Install the Vercel CLI if you want to test the serverless routes locally: `npm i -g vercel`.
3. Run `vercel dev` from the project root. This serves `index.html` as static output while enabling the `/api/*` routes.

## Deployment to Vercel

1. Create a new Vercel project pointing at this repository.
2. In the Vercel dashboard set the environment variables listed in `env.sample`.
3. Deploy. Vercel will:
   - serve `index.html` as a static asset,
   - expose `/api/config` (returns Firebase config + model metadata),
   - expose `/api/predict` (proxies Gemini requests with server-held keys).

## Security posture

- Firebase config lives exclusively in environment variables and is fetched at runtime via `/api/config`, so keys never sit in the git history.
- Gemini API access occurs exclusively on the serverless function (`/api/predict`), preventing the browser from seeing raw API keys.
- Requests from the client include only contextual data; the serverless layer formats and validates the LLM contract before forwarding to Gemini.

