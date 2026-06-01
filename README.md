<div align="center">
  <img src="app-icon.svg" alt="Resume AI Spark Logo" width="120" />
  <h1>Resume AI Spark</h1>
  <p>A comprehensive, interactive, and AI-powered resume builder designed to help software engineers and professionals craft highly effective resumes.</p>
</div>

<br />

Resume AI Spark is built to eliminate the frustration of formatting static resume templates. It is a full-featured application that combines real-time PDF rendering, strict page-overflow monitoring, and an integrated AI companion to help you write professional, ATS-friendly bullet points.

Whether you are starting from scratch or importing an old resume, this tool provides an isolated, secure workspace to refine your professional profile and export a clean PDF.

---

## Comprehensive Feature List

### 1. Interactive Real-Time Builder
The core of the application is a side-by-side interactive editor. As you add or edit your work experience, education, or skills, the PDF renders your changes instantly. You never have to guess what the final layout will look like.

### 2. Smart PDF Import & Parsing
If you already have a resume, you don't need to type everything from scratch. The application features a robust backend parser that reads your existing PDF, extracts the text and embedded hyperlinks, and smartly maps them into the interactive builder. 

### 3. Spark AI Companion
Instead of just giving you a text box, Resume AI Spark includes a fully integrated AI assistant (powered by Google Gemini). 
- **1-Click Rewrites:** Ask the AI to rewrite a bullet point to sound more professional, and you can apply the change to your resume with a single click.
- **Metric Enhancements:** The AI helps you identify areas where you can add quantifiable metrics to improve your impact.
- **Quality Scoring:** The system can evaluate your resume's grammar, parsability, and repetition, giving you a tangible score to improve upon.

### 4. Supabase Authentication & Private Workspaces
Security and data privacy are treated as first-class features. The app utilizes Supabase to provide secure OAuth sign-in via Google or GitHub. Once logged in, every user is provided with their own isolated database sandbox secured by Row Level Security (RLS) policies, meaning your data is strictly yours.

### 5. Smart Space Budgeting
One of the most common resume mistakes is accidentally bleeding content onto a second page. Resume AI Spark includes a visual space budgeting system that calculates exactly how much room you have left, warning you before your resume overflows the standard one-page limit.

### 6. JSON Backup & Restore
You have full ownership of your data. At any time, you can export your entire resume structure as a lightweight JSON file. You can keep this on your local machine and import it back into the app whenever you need to make future updates.

---

## Technical Architecture

The application is split between a lightning-fast React frontend and a Node.js Express backend designed to handle intensive native tasks like PDF binary parsing.

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide React (for iconography)
- **AI Engine:** Google Gemini SDK (`gemini-2.5-flash`)
- **Backend:** Node.js, Express, `pdf-parse` (with native Canvas bindings for accurate text extraction)
- **Database & Auth:** Supabase (PostgreSQL, OAuth)
- **Production Bundler:** ESBuild (with externalized packages for native binary support)

---

## Local Development Setup

If you want to run Resume AI Spark locally to test or contribute, follow these instructions to set up the environment.

### 1. Clone the repository
```bash
git clone https://github.com/Khushi2325/Resume-AI-Spark.git
cd Resume-AI-Spark
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
You will need a Supabase project and a Google Gemini API key. Create a `.env` file in the root of the project and add the following keys:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-google-gemini-key
```

### 4. Start the Application
To start both the Vite frontend server and the Express backend simultaneously, run:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Supabase Database Configuration

If you are setting up your own Supabase instance, you need to ensure the database can securely accept user profiles.

1. Navigate to **Authentication > Providers** in your Supabase dashboard and enable **Google** and **GitHub**.
2. Run the following SQL snippet in your Supabase SQL Editor to establish the Row Level Security (RLS) policies. This ensures users can only read and write their own data:

```sql
-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);
```

---

## Production Deployment Notes

When deploying this application as a Web Service (e.g., on Render), the build process utilizes `esbuild` to bundle the backend. Because the PDF parser relies on native C++ binaries, the `package.json` build script explicitly uses the `--packages=external` flag. This prevents `esbuild` from breaking the native module bindings during compression, ensuring PDF parsing works flawlessly in production.

## License

This project is open-source and available under the [MIT License](LICENSE).
