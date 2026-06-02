<div align="center">
  <img src="app-icon.svg" alt="Resume AI Spark Logo" width="120" />
  <h1>Resume AI Spark</h1>
  <p><strong>AI-Powered Resume Builder with Real-Time Preview, Smart PDF Import, and Secure Cloud Storage</strong></p>
</div>

---

## Overview

Resume AI Spark is a modern web application that helps students, job seekers, and professionals create polished, ATS-friendly resumes without struggling with formatting, templates, or repetitive editing. It combines real-time resume building, AI-assisted content enhancement (powered by Gemini), PDF importing, resume quality analysis, and secure cloud storage into a single seamless experience.

## Key Features

- **Interactive Resume Builder**: Manage education, projects, certifications, technical skills, and professional experience with instant visual feedback.
- **Real-Time PDF Preview**: Watch your layout and formatting update instantly as you type, eliminating the need for constant exporting.
- **Smart PDF Import**: Upload an existing resume PDF to automatically extract and map your experience, skills, and bullet points directly into the editor using AI extraction.
- **AI-Powered Refinement**: Integrate Google's Gemini AI to rewrite simple statements into professional, action-oriented bullet points.
- **Resume Quality Analysis**: Evaluate your resume for grammar, repetition, ATS compatibility, and content strength.
- **Smart Space Budgeting**: Continuously monitors available space and provides warnings before your content exceeds the optimal one-page limit.
- **Secure Cloud Workspace**: Save and sync your resumes across devices securely via Supabase Authentication and PostgreSQL.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js
- **Artificial Intelligence**: Google Gemini 2.5 Flash API
- **Database & Auth**: PostgreSQL, Supabase (OAuth + RLS)
- **PDF Processing**: pdf-parse, Puppeteer (Headless PDF Export)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Khushi2325/Resume-AI-Spark.git
cd Resume-AI-Spark
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root with the following keys:
```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### 4. Run Locally
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

## Architecture Overview
The frontend is a React Single Page Application (SPA) communicating with an Express.js server. The server acts as a proxy to handle heavy PDF parsing, Gemini AI communication, and Headless PDF generation, while Supabase handles direct user authentication and database synchronization.

## License
This project is licensed under the MIT License.

<div align="center">
  <p>Built with the goal of making resume creation simpler, smarter, and more accessible.</p>
</div>