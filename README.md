<div align="center">
  <img src="./public/app-icon.svg" alt="Resume AI Spark Logo" width="120" />

  # Resume AI Spark

  **The ultimate AI-powered toolkit for crafting perfectly formatted, high-impact corporate and academic resumes.**

  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
  
  [Features](#features) • [Quick Start](#quick-start) • [Architecture](#project-layout)

</div>

---

## About The Project

**Resume AI Spark** is a focused resume builder and presentation workspace built by Khushi Chorvadi. It combines a pristine **Live WYSIWYG Editor**, a strict print-ready preview (PDF/print CSS friendly), and an optional Supabase-backed persistent storage system. 

What makes it unique? The backend proxies **Google Gemini AI** calls to act as your personal career assistant—offering real-time feedback, professional rewrite suggestions, and impact-driven bullet point enhancements.

---

## Features

- **Vibrant, Pristine UI**: An incredibly clean, modern "Blue & White" aesthetic featuring glassmorphism, dynamic shadows, and meticulously crafted typography.
- **Live WYSIWYG Editor**: Watch your resume compile instantly side-by-side as you type. No waiting, no refreshing.
- **Print-Ready Layout Controls**: Fine-tune spacing, typography, and density to guarantee your resume looks perfect whether viewed on a screen or printed on paper.
- **Gemini AI Assistant**: Stuck on how to phrase a bullet point? The built-in AI will analyze your experience and suggest powerful, action-oriented rewrites.
- **Supabase Cloud Storage**: Optionally save and sync your profiles securely using Supabase Auth & Database.
- **Fully Responsive**: A seamless experience across desktop workspaces and mobile devices.

---

## Quick Start

**Prerequisites:** Node.js (v18+), npm.

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/Khushi2325/Resume-AI-Spark.git
cd Resume-AI-Spark
npm install
```

### 2. Environment Configuration

Copy the example environment file and fill in your keys:

```bash
cp .env.example .env
```
Open `.env` and set the following:
- `GEMINI_API_KEY`: Google Gemini API key (Required for AI features).
- `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`: (Optional) For enabling persistent cloud storage.

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React (Icons).
- **Tooling:** Vite, ESLint, PostCSS.
- **Backend (Proxy):** Express.js (used for securely proxying AI requests and serving the production build).
- **AI Integration:** Google Gemini / Google AI Studio API.
- **Database (Optional):** Supabase (PostgreSQL).

---

## Project Layout

- `src/components/` — Core UI components:
  - `DigitalDashboard` — The landing page and feature showcase.
  - `ResumeDataEditor` — The interactive form editor.
  - `LatexPrintView` — The strictly formatted, print-optimized resume viewer.
- `src/App.tsx` — Main application shell, routing, and theme orchestration.
- `server.ts` — Express proxy server for handling Gemini AI streams and production asset serving.
- `src/supabaseClient.ts` — Database wrapper.

---

## Build & Deploy

1. Build the frontend and server bundle for production:
```bash
npm run build
```

2. Start the compiled production server:
```bash
npm start
```

*Note: For production deployment (Vercel, Render, Heroku), ensure you supply the `GEMINI_API_KEY` in your host's secure environment variable manager.*

---

## Contributing

Contributions, issues, and feature requests are always welcome. Feel free to check the [issues page](https://github.com/Khushi2325/Resume-AI-Spark/issues) if you want to contribute.

---

<div align="center">
  <p>Crafted by Khushi Chorvadi</p>
  <p>
    <a href="https://github.com/Khushi2325">GitHub</a> • 
    <a href="https://www.linkedin.com/in/khushi-chorvadi-03857a28a/">LinkedIn</a> • 
    <a href="https://x.com/Khushi4317">Twitter</a>
  </p>
</div>
