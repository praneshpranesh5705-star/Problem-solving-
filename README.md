# NOVA AI

Upload an image → AI explains it or solves maths/science problems.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env.local` and put your key from https://console.anthropic.com
3. `npm run dev` → http://localhost:3000

## Deploy on Vercel
1. Push this folder to a GitHub repo.
2. Vercel → Add New Project → import the repo.
3. Settings → Environment Variables → add `ANTHROPIC_API_KEY` (optional: `ANTHROPIC_MODEL`).
4. Deploy. Open the URL on your phone — image upload works.

## Notes
- The key stays on the server (`app/api/solve/route.js`), never in the browser.
- Basic rate limit: 8 requests/min per IP. Set a monthly spend limit in the Anthropic console.
