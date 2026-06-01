# ⚡ Resume AI Spark

**Resume AI Spark** is an elite, interactive CV ecosystem designed specifically to help software engineers, developers, and tech professionals craft resumes that land top roles. 

Move beyond static templates with real-time PDF builders, smart page-overflow budget checkers, isolated account workspaces, and a smart AI chatbot companion that proofreads and applies metric rewrites in 1-click.

![Resume AI Spark Preview](https://resume-ai-spark.onrender.com/favicon.ico)

## 🚀 Key Features

- **Interactive Real-Time Builder**: Watch your resume update in real-time as you edit.
- **AI Chatbot Companion (Spark AI)**: Get smart recommendations to boost your professional summary and bullet points. Ask the AI to rewrite your experience for maximum impact.
- **Supabase OAuth**: Secure, frictionless sign-in with Google and GitHub. No more passwords to remember.
- **Isolated Multi-User Sandboxes**: Every user gets their own isolated workspace and database storage.
- **Smart Space Budgeting**: Visual indicators help you prevent your resume from bleeding onto a second page.
- **LaTeX-Quality PDF Export**: Download crisp, perfectly formatted PDFs ready for ATS systems.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Backend/Auth**: Supabase (PostgreSQL, Row Level Security, OAuth)
- **Deployment**: Render / Vercel

## 💻 Local Development Setup

To run Resume AI Spark locally on your machine, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/Khushi2325/Resume-AI-Spark.git
cd Resume-AI-Spark
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🔒 Authentication Configuration

If you are setting up your own Supabase instance:
1. Go to **Authentication > Providers** in Supabase and enable **Google** and **GitHub**.
2. Run the following SQL in your Supabase SQL Editor to allow new users to save their profiles:
   ```sql
   CREATE POLICY "Users can insert their own profile" 
   ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can update own profile" 
   ON profiles FOR UPDATE USING (auth.uid() = id);
   ```

## 📄 License

This project is open-source and available under the MIT License.
