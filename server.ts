import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";
// PDF parse is imported dynamically in the route

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Initialize Gemini SDK with telemetry User-Agent as instructed
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Chatbot Proxy Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, currentResume } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_ACTUAL_GEMINI_API_KEY_HERE" || apiKey.includes("YOUR_ACTUAL")) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured in the server environment. Please replace the placeholder value in your .env file with a valid Google AI Studio API key." 
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid 'messages' array provided." });
    }

    // Format previous conversation history for the model
    // Using simple format or System Instruction configuration
    const historyParts = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.text }]
    }));

    // Inject current resume context in prompt or system instruction
    const systemInstruction = `You are a friendly, human-like professional career coach and resume strategist.
You are helping the user optimize, rewrite, and refine their resume to land outstanding jobs.
The user is viewing their live interactive resume editor alongside your help chat.

Here is the user's CURRENT RESUME DATA in real-time format:
${JSON.stringify(currentResume, null, 2)}

CRITICAL TONE & CONVERSATIONAL RULES (STRICT COMPLIANCE REQUIRED):
1. **Plain Layman English ONLY**: Always speak in elegant, standard, highly professional everyday English that any layman/child can fully understand instantly. Do NOT use programming jargon, developer acronyms, system variables, database terms, or code syntax in your speech.
2. **NEVER Display JS/JSON Code in your Conversation**: Do NOT show raw JSON, Javascript snippets, curly braces {}, bracket structures, array indices, or variable keys in your normal message text to the user. Explain suggested enhancements descriptively like a wise human career writer would.
3. **Friendly, encouraging, and clear companion**: Keep your responses short, conversational, and structured with clean formatting or simple bullet points. Avoid overwhelming paragraphs.
4. **Interactive Merge System**: If the user requests to update, improve, restructure, or rewrite a section of their resume:
   - First give the user a clear, natural-language explanation of what you would improve and why.
   - Then provide a Markdown code block with exactly this syntax: \`\`\`json_apply
   - Inside that block, provide a valid JSON object matching the ResumeData format with ONLY the updated fields.
   - Do NOT show raw JSON or code outside of this specific block. The frontend will hide the \`\`\`json_apply block from the user and convert it into a "1-Click Apply" button.
   - Make your normal conversation text sound human, polished, and friendly.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: "Introduce yourself, briefly review my resume summary, and tell me how you can assist me today." }]
        },
        ...historyParts
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ 
      error: error?.message || "An error occurred while communicating with the AI Assistant." 
    });
  }
});

const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/parse-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_ACTUAL_GEMINI_API_KEY_HERE") {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const isPdf = req.file.mimetype === "application/pdf";

    // ── Step 1: Try pdf-parse to extract raw text for URL pre-scanning ────────
    let rawText = "";
    if (isPdf) {
      try {
        const pdfMod = await import("pdf-parse");
        const pdfFn: any = pdfMod.default ?? pdfMod;
        if (typeof pdfFn === "function") {
          const data = await pdfFn(req.file.buffer);
          rawText = data?.text ?? "";
        }
      } catch { rawText = ""; }
    } else {
      rawText = req.file.buffer.toString("utf-8");
    }

    // ── Step 2: Regex pre-scan to find ALL known URL patterns ─────────────────
    // This guarantees we catch links even if Gemini misses them visually.
    const urlRe = /(?:https?:\/\/)?(?:www\.)?(?:[-a-zA-Z0-9@:%._+~#=]{1,256})\.(?:[a-zA-Z]{2,10})(?:\/[-a-zA-Z0-9()@:%_+.~#?&/=]*)?/g;
    const knownDomains = [
      "github.com", "linkedin.com", "leetcode.com",
      "vercel.app", "netlify.app", "railway.app", "render.com",
      "herokuapp.com", "drive.google.com", "credly.com",
      "coursera.org", "udemy.com", "hackerrank.com",
    ];
    const scannedUrls = [...new Set(
      (rawText.match(urlRe) ?? []).filter(u => knownDomains.some(d => u.includes(d)))
    )];

    const urlHint = scannedUrls.length > 0
      ? `\n\n===PRE-SCANNED URLS FOUND IN DOCUMENT===\nI pre-scanned the document text and found these URLs. You MUST use these in the correct fields:\n${scannedUrls.map(u => `  - ${u}`).join("\n")}\n\nMapping guide:\n- github.com/username (no repo path) → personalInfo.github\n- linkedin.com/in/... → personalInfo.linkedin\n- leetcode.com/... → personalInfo.leetcode\n- github.com/user/repo-name → projects[matching project].githubUrl\n- vercel.app / netlify.app / live sites → projects[matching project].liveUrl\n- coursera / udemy / credly → certifications[matching cert].certificateUrl\n===END PRE-SCANNED URLS===`
      : "";

    // ── Step 3: Build the comprehensive extraction prompt ─────────────────────
    const systemInstruction = `You are a world-class resume parser AI. Your ONLY job is to extract information from the resume document provided and return it as structured JSON.

EXTRACTION MANDATE — follow every point without exception:

PERSONAL INFO:
• name: Full name of the person
• phone: Phone number with country code
• email: Email address
• github: Full GitHub profile URL (e.g. https://github.com/username). Look for github.com links in the header, contact section, footer, or anywhere. If you see "github.com/xyz" add https:// prefix.
• linkedin: Full LinkedIn profile URL (e.g. https://linkedin.com/in/username). Look for linkedin.com links anywhere in the document.
• leetcode: Full LeetCode profile URL (e.g. https://leetcode.com/username). Look for leetcode.com links anywhere.

EDUCATION: Extract ALL education entries (university, school, certifications from academic institutions).

EXPERIENCE: Extract ALL work experience — internships, part-time jobs, full-time jobs, freelance work. Do NOT skip any.

SKILLS: Group all technical skills by category. Common categories: Languages, Backend, Frontend, Tools, Databases, Cloud, Core/CS Fundamentals.

PROJECTS: For each project:
• title: Project name
• year: Year or date range
• bullets: Each bullet point as a separate string
• techStack: Technologies used, extracted from "Stack:" or "Tech:" labels or bullet content
• githubUrl: The GitHub repository URL specifically for THIS project (e.g. github.com/user/project-name). Each project may have its own GitHub link.
• liveUrl: The live/deployed URL for THIS project (vercel.app, netlify.app, any custom domain shown)

CERTIFICATIONS: For each certification:
• title: Certificate/course name
• issuer: Platform or organization (Coursera, CodeChef, ServiceNow, etc.)
• year: Year earned
• bullets: Any description bullet points
• certificateUrl: The verification/credential link if present
• badgeUrl: Any badge URL

RULES:
1. Every URL must start with https://. If missing, add it.
2. Empty fields → use "" for strings and [] for arrays.
3. IDs must follow pattern: edu-1, exp-1, skill-1, proj-1, cert-1 (increment for each).
4. Extract bullet points as individual array items, NOT as one long string.
5. Tech stack in projects must be an array of individual technology names.${urlHint}`;

    const prompt = `Parse this resume completely and extract ALL information including every URL, link, project, experience entry, skill, and certification. Return structured JSON only.`;

    // ── Step 4: Build Gemini content parts ───────────────────────────────────
    const parts: any[] = [];
    if (isPdf) {
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: req.file.buffer.toString("base64"),
        },
      });
    } else {
      parts.push({ text: `RESUME CONTENT:\n\n${rawText}` });
    }
    parts.push({ text: prompt });

    // ── Step 5: Call Gemini with structured JSON output mode ──────────────────
    // responseSchema forces Gemini to output perfectly valid JSON every time.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object" as any,
          properties: {
            personalInfo: {
              type: "object",
              properties: {
                name: { type: "string" },
                phone: { type: "string" },
                email: { type: "string" },
                github: { type: "string" },
                linkedin: { type: "string" },
                leetcode: { type: "string" },
              },
              required: ["name", "phone", "email", "github", "linkedin", "leetcode"],
            },
            professionalSummary: { type: "string" },
            education: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  institution: { type: "string" },
                  years: { type: "string" },
                  degree: { type: "string" },
                  location: { type: "string" },
                },
                required: ["id", "institution", "years", "degree", "location"],
              },
            },
            experience: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  company: { type: "string" },
                  role: { type: "string" },
                  duration: { type: "string" },
                  location: { type: "string" },
                  bullets: { type: "array", items: { type: "string" } },
                },
                required: ["id", "company", "role", "duration", "location", "bullets"],
              },
            },
            skills: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  category: { type: "string" },
                  skills: { type: "array", items: { type: "string" } },
                },
                required: ["id", "category", "skills"],
              },
            },
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  year: { type: "string" },
                  bullets: { type: "array", items: { type: "string" } },
                  techStack: { type: "array", items: { type: "string" } },
                  githubUrl: { type: "string" },
                  liveUrl: { type: "string" },
                },
                required: ["id", "title", "year", "bullets", "techStack"],
              },
            },
            certifications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  issuer: { type: "string" },
                  year: { type: "string" },
                  bullets: { type: "array", items: { type: "string" } },
                  certificateUrl: { type: "string" },
                  badgeUrl: { type: "string" },
                },
                required: ["id", "title", "issuer", "year", "bullets"],
              },
            },
          },
          required: ["personalInfo", "professionalSummary", "education", "experience", "skills", "projects", "certifications"],
        },
      },
    });

    // ── Step 6: Parse response — responseSchema guarantees valid JSON ─────────
    const parsedJson = JSON.parse(response.text ?? "{}");

    // ── Step 7: Post-process — ensure https:// on all URL fields ─────────────
    const ensureHttps = (url: string): string => {
      if (!url || url.trim() === "") return "";
      const u = url.trim();
      if (u.startsWith("http://") || u.startsWith("https://")) return u;
      return `https://${u}`;
    };

    if (parsedJson.personalInfo) {
      parsedJson.personalInfo.github   = ensureHttps(parsedJson.personalInfo.github ?? "");
      parsedJson.personalInfo.linkedin = ensureHttps(parsedJson.personalInfo.linkedin ?? "");
      parsedJson.personalInfo.leetcode = ensureHttps(parsedJson.personalInfo.leetcode ?? "");
    }

    if (Array.isArray(parsedJson.projects)) {
      parsedJson.projects = parsedJson.projects.map((p: any) => ({
        ...p,
        githubUrl: ensureHttps(p.githubUrl ?? ""),
        liveUrl:   ensureHttps(p.liveUrl   ?? ""),
      }));
    }

    if (Array.isArray(parsedJson.certifications)) {
      parsedJson.certifications = parsedJson.certifications.map((c: any) => ({
        ...c,
        certificateUrl: ensureHttps(c.certificateUrl ?? ""),
        badgeUrl:       ensureHttps(c.badgeUrl       ?? ""),
      }));
    }

    res.json(parsedJson);
  } catch (error: any) {
    console.error("Parse Resume Error:", error);
    res.status(500).json({ error: error?.message ?? "Failed to parse resume." });
  }
});


// Setup self-ping to prevent Render from putting the free tier to sleep (10 min interval)
app.get("/api/ping", (req, res) => {
  res.status(200).send("pong");
});

const PING_INTERVAL = 10 * 60 * 1000;
setInterval(() => {
  const url = process.env.APP_URL || "https://resume-ai-spark.onrender.com";
  fetch(`${url}/api/ping`)
    .then(res => console.log(`[Self-Ping] Successfully pinged ${url} to keep server awake (Status: ${res.status})`))
    .catch(err => console.error(`[Self-Ping] Failed to ping ${url}:`, err.message));
}, PING_INTERVAL);

// Setup Vite & Static Handlers
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
};

startServer();
