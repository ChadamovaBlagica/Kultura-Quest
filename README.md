
# Kultura Quest

Kultura Quest is a Skopje cultural discovery app. The `main` branch is deployed to GitHub Pages by the workflow in `.github/workflows/deploy-pages.yml`.

## Run Locally

**Prerequisites:** Bun or Node.js

1. Install dependencies with `bun install` (or `npm install --legacy-peer-deps`).
2. For the AI-backed API endpoints, set `GEMINI_API_KEY` in your local environment.
3. Start the development server with `bun run dev` (or `npm run dev`).

## GitHub Pages

Every push to `main` builds and deploys the static frontend to `https://chadamovablagica.github.io/Kultura-Quest/`. The repository's Pages source must be set to **GitHub Actions** in Settings → Pages.

GitHub Pages serves only static files. The Express API routes (`/api/guide`, `/api/scan-poster`, and `/api/generate-adventure`) require a separate server deployment and are not available on the Pages site. Keep `GEMINI_API_KEY` on that server; do not add it to the frontend or repository.
