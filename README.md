# Resume AI Spark

![Project banner](./readme-banner.svg)

A polished resume builder and presentation workspace for Khushi Chorvadi. The app combines a live resume editor, a premium print-ready preview, and a clean export flow for creating a strong personal presentation.

## What it does

- Live resume editing with immediate preview updates.
- Print-focused layout controls for spacing, typography, zoom, and section density.
- Gemini-powered chat assistant for resume feedback and rewrite suggestions.
- Local account/session storage for quick switching between saved workspace state.
- Export-friendly setup for a clean resume and portfolio-style presentation.

## Getting started

1. Install dependencies.

```bash
npm install
```

2. Create your environment file.

```bash
cp .env.example .env
```

3. Add your Gemini key to `.env`.

```bash
GEMINI_API_KEY=your_real_key_here
```

4. Start the app.

```bash
npm run dev
```

Open the local app in your browser and try the chat panel once the server is running.

## Scripts

- `npm run dev` starts the Express server with Vite middleware.
- `npm run build` builds the frontend and bundles the server for production.
- `npm start` runs the production server from `dist/server.cjs`.
- `npm run lint` runs the TypeScript type check.

## Environment

Required variable:

- `GEMINI_API_KEY` - Google Gemini / Google AI Studio API key used by the backend.

## Project structure

- `src/` contains the React app, resume editor, preview, and shared utilities.
- `server.ts` handles the Gemini proxy endpoint and production/static serving.
- `index.html` and `vite.config.ts` support the frontend build.

## Notes

The design is intentionally geared toward a premium resume workflow rather than a generic dashboard. If you want, I can also tighten the copy inside the app itself so the landing page and README feel fully matched.