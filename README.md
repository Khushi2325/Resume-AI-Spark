<div align="center">
  <img src="app-icon.svg" alt="Resume AI Spark Logo" width="120" />
  <h1>Resume AI Spark</h1>
  <p>An interactive, AI-powered resume builder designed to help professionals craft clean, effective, ATS-friendly resumes.</p>
</div>

<br />

## 🌟 Key Features

- **Interactive Real-Time Builder:** See your resume update live as you type and edit.
- **AI Assistant:** Get helpful recommendations for your professional summary and bullet points, or have the AI rewrite your experience sections for better clarity.
- **Supabase Authentication:** Secure sign-in using Google and GitHub.
- **Private Workspaces:** Each user gets their own isolated workspace to store their resume data securely.
- **Space Budgeting:** Visual indicators help you keep your resume content strictly on one page.
- **PDF Export:** Download clean, properly formatted PDFs that are ready to be parsed by ATS systems.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide React
- **Backend & Auth:** Supabase (PostgreSQL, Row Level Security)
- **Deployment:** Render / Vercel

---

## 💻 Local Setup

To run Resume AI Spark locally on your own machine, follow these steps:

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
Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start the server
```bash
npm run dev
```

The application will now be running at `http://localhost:3000`.

---

## 🔒 Supabase Configuration

If you are setting up your own Supabase backend:
1. Go to **Authentication > Providers** in your Supabase dashboard and enable **Google** and **GitHub**.
2. Run the following SQL snippet in your Supabase SQL Editor to allow new users to save their profiles properly:
   ```sql
   CREATE POLICY "Users can insert their own profile" 
   ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can update own profile" 
   ON profiles FOR UPDATE USING (auth.uid() = id);
   ```

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
