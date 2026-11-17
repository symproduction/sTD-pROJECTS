# MediAI – Your Smart Health Assistant

MediAI is a responsive, privacy-first healthcare literacy web application providing three dedicated AI-powered educational tools:

1. **AI Health Assistant** (`/api/health-assistant`) — Session-only conversational assistant offering plain-English educational health guidance and automatic emergency red-flag awareness.
2. **AI Medical Report Explainer** (`/api/report/analyze`) — In-memory multimodal analyzer supporting **PDF, JPG, and PNG** uploads (up to 10 MB) returning 7 structured cards without saving files to disk or inventing missing ranges.
3. **AI Medicine Information Assistant** (`/api/medicine/info`) — Queries the official U.S. FDA Drug Labeling API (`api.fda.gov`) and grounded clinical references to present verified generic names, uses, side effects, precautions, warnings, and consultation guidance.

## Architecture & Dual-Provider Failover

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide icons, 8 full pages (`Home`, `AI Health Assistant`, `Medical Report Explainer`, `Medicine Information`, `About Us`, `Contact Us`, `Privacy Policy`, `Medical Disclaimer`), dark/light theme support, and responsive mobile navigation.
- **Backend Proxy (`server.ts` & `server/aiServices.ts`)**: Express server running Vite middleware in development and serving `dist/` in production.
  - **Primary Provider**: `@google/genai` (`gemini-4-hydrogen`) via `process.env.GEMINI_API_KEY`.
  - **Automatic Fallback**: If `process.env.OPENAI_API_KEY` is also configured in server secrets, any Gemini rate limit (`429`), timeout (`504`), or upstream error automatically fails over to OpenAI (`gpt-4o-mini`) on the server.

## Setup & Local Testing

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Set your keys in AI Studio **Settings > Secrets** (never commit real keys in code):
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   OPENAI_API_KEY="your-optional-openai-fallback-key"
   ```

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
