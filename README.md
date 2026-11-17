# MediAI – Your Smart Health Assistant

MediAI is a responsive, privacy-first healthcare literacy web application providing three dedicated AI-powered educational tools:

1. **AI Health Assistant** (`/api/health-assistant`) — Session-only conversational assistant offering plain-English educational health guidance and automatic emergency red-flag awareness.
2. **AI Medical Report Explainer** (`/api/report/analyze`) — In-memory multimodal analyzer supporting **PDF, JPG, and PNG** uploads (up to 10 MB) returning 7 structured cards without saving files to disk or inventing missing ranges.
3. **AI Medicine Information Assistant** (`/api/medicine/info`) — Queries the official U.S. FDA Drug Labeling API (`api.fda.gov`) and Google Search grounding to present verified generic names, uses, side effects, precautions, warnings, and consultation guidance.

## Architecture Overview

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide icons, 8 full pages (`Home`, `AI Health Assistant`, `Medical Report Explainer`, `Medicine Information`, `About Us`, `Contact Us`, `Privacy Policy`, `Medical Disclaimer`), dark/light theme support, and responsive mobile navigation.
- **Backend Proxy (`server.ts` & `server/aiServices.ts`)**: Express server running Vite middleware in development and serving `dist/` in production. All `@google/genai` calls execute strictly server-side using `process.env.GEMINI_API_KEY`.

## Setup & Local Testing

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` (or set secrets in AI Studio **Settings > Secrets**) and set:
   ```env
   GEMINI_API_KEY="your-server-api-key"
   ```
   Never place API keys in frontend source files.

3. **Run in development** (port `3000`):
   ```bash
   npm run dev
   ```

4. **Type-check & build for production**:
   ```bash
   npm run lint
   npm run build
   npm start
   ```
