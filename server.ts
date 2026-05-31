import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { "User-Agent": "aistudio-build" } },
});

// ─────────────────────────────────────────────────────────────────────────────
// AI Chat Proxy
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, currentResume } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_ACTUAL_GEMINI_API_KEY_HERE" || apiKey.includes("YOUR_ACTUAL")) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured. Please add a valid key in your .env file.",
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid 'messages' array provided." });
    }

    const historyParts = messages.map((msg) => ({
      role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: msg.text }],
    }));

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
          parts: [{ text: "Introduce yourself, briefly review my resume summary, and tell me how you can assist me today." }],
        },
        ...historyParts,
      ],
      config: { systemInstruction, temperature: 0.7 },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ error: error?.message || "An error occurred while communicating with the AI Assistant." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Resume PDF Parser
// ─────────────────────────────────────────────────────────────────────────────
const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/parse-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_ACTUAL_GEMINI_API_KEY_HERE") {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const isPdf = req.file.mimetype === "application/pdf";

    // ── 1. Extract text AND link annotations via new PDFParse class ───────────
    let rawText = "";
    const annotationUrls: string[] = [];

    if (isPdf) {
      try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: req.file.buffer });

        // Extract plain text with hyperlinks embedded in markdown style
        const textResult = await parser.getText({ parseHyperlinks: true });
        rawText = textResult.text ?? "";

        // Extract link annotations from the PDF structure
        const info = await parser.getInfo({ parsePageInfo: true });
        for (const page of info.pages ?? []) {
          for (const linkObj of page.links ?? []) {
            if (linkObj.url) {
              const cleanedUrl = linkObj.url.trim();
              if (cleanedUrl.toLowerCase().startsWith("mailto:")) {
                continue;
              }
              annotationUrls.push(cleanedUrl);
            }
          }
        }
        await parser.destroy();
      } catch (e: any) {
        console.error("[ResumeParser] PDFParse error:", e);
        rawText = "";
      }
    } else {
      rawText = req.file.buffer.toString("utf-8");
    }

    // ── 2. Also scan the raw PDF binary (catches uncompressed PDFs) ───────────
    if (isPdf && annotationUrls.length === 0) {
      try {
        const pdfRaw = req.file.buffer.toString("latin1");
        // /URI (url) — standard
        const p1 = /\/URI\s*\(([^)]+)\)/g;
        let m: RegExpExecArray | null;
        while ((m = p1.exec(pdfRaw)) !== null) {
          const u = m[1].replace(/\\\)/g, ")").trim();
          if (u.length > 5) annotationUrls.push(u);
        }
        // Broad http(s) URL scan
        const broadUrlRe = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-zA-Z]{2,10}(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/g;
        for (const u of (pdfRaw.match(broadUrlRe) ?? [])) {
          const lo = u.toLowerCase();
          if (lo.includes("github") || lo.includes("linkedin") || lo.includes("leetcode") ||
              lo.includes("vercel") || lo.includes("netlify") || lo.includes("railway") ||
              lo.includes("render") || lo.includes("heroku") || lo.includes("credly") ||
              lo.includes("coursera") || lo.includes("udemy") || lo.includes("hackerrank")) {
            annotationUrls.push(u);
          }
        }
        // No-https patterns
        for (const re of [
          /github\.com\/[a-zA-Z0-9_-]{2,39}(?:\/[a-zA-Z0-9_.-]+)?/g,
          /linkedin\.com\/in\/[a-zA-Z0-9_-]{2,100}/g,
          /leetcode\.com\/(?:u\/)?[a-zA-Z0-9_-]{2,50}/g,
        ]) {
          let pm: RegExpExecArray | null;
          while ((pm = re.exec(pdfRaw)) !== null) annotationUrls.push(`https://${pm[0]}`);
        }
      } catch { /* silent */ }
    }

    // ── 3. Text-level URL regex scan ──────────────────────────────────────────
    const knownDomains = [
      "github.com", "linkedin.com", "leetcode.com",
      "vercel.app", "netlify.app", "railway.app", "render.com",
      "herokuapp.com", "drive.google.com", "credly.com",
      "coursera.org", "udemy.com", "hackerrank.com",
    ];
    const urlRe = /(?:https?:\/\/)?(?:www\.)?(?:[-a-zA-Z0-9@:%._+~#=]{2,256})\.(?:[a-zA-Z]{2,10})(?:\/[-a-zA-Z0-9()@:%_+.~#?&/=]*)?/g;
    const textUrls = (rawText.match(urlRe) ?? []).filter((u) =>
      knownDomains.some((d) => u.toLowerCase().includes(d))
    );

    // ── 4. Merge + deduplicate all found URLs ─────────────────────────────────
    const allUrls = [...new Set([...annotationUrls, ...textUrls].map((u) => u.trim()).filter(Boolean))];
    console.log("[ResumeParser] Extracted URLs from PDF:", allUrls);

    // ── 5. Extract profile URLs from text when annotations only give base domains ───
    // PDFs sometimes store icon links with only the base domain (e.g. https://github.com/)
    // In that case, we try to extract the full profile path from the visible PDF text.
    const getPath = (url: string, domain: string): string => {
      const after = url.toLowerCase().split(domain)[1] ?? "";
      return after.replace(/^\//, ""); // strip leading slash
    };

    // GitHub: prefer github.com/username (1 path segment, at least 2 chars)
    let githubProfile = allUrls.find((u) => {
      if (!u.includes("github.com")) return false;
      const path = getPath(u, "github.com");
      return path.length >= 2 && !path.includes("/"); // exactly 1 segment = profile
    });
    // Fallback: extract from raw text (e.g. visible text "github.com/Khushi2325")
    if (!githubProfile) {
      const tm = rawText.match(/github\.com\/([a-zA-Z0-9_-]{2,39})(?![/\w])/i);
      if (tm) githubProfile = `https://github.com/${tm[1]}`;
    }
    // GitHub repo URLs (2 path segments = github.com/user/repo)
    const githubRepos = allUrls.filter((u) => {
      if (!u.includes("github.com")) return false;
      const path = getPath(u, "github.com");
      return path.includes("/") && path.split("/").filter(Boolean).length >= 2;
    });

    // LinkedIn: prefer linkedin.com/in/... (has /in/ path)
    let linkedinProfile = allUrls.find((u) => u.includes("linkedin.com/in/"));
    if (!linkedinProfile) {
      linkedinProfile = allUrls.find((u) => {
        if (!u.includes("linkedin.com")) return false;
        return getPath(u, "linkedin.com").length >= 2;
      });
    }
    // Fallback: extract from raw text
    if (!linkedinProfile) {
      const tm = rawText.match(/linkedin\.com\/(in\/[a-zA-Z0-9_-]+)/i);
      if (tm) linkedinProfile = `https://www.linkedin.com/${tm[1]}`;
    }

    // LeetCode: leetcode.com/u/username or leetcode.com/username
    let leetcodeProfile = allUrls.find((u) => {
      if (!u.includes("leetcode.com")) return false;
      return getPath(u, "leetcode.com").length >= 2;
    });
    if (!leetcodeProfile) {
      const tm = rawText.match(/leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]{2,})/i);
      if (tm) leetcodeProfile = `https://leetcode.com/${tm[1]}`;
    }

    // Live/cert links (unchanged)
    const liveLinks = allUrls.filter((u) =>
      u.includes("vercel.app") || u.includes("netlify.app") ||
      u.includes("railway.app") || u.includes("render.com") || u.includes("herokuapp.com")
    );
    const certLinks = allUrls.filter((u) =>
      u.includes("credly") || u.includes("coursera") ||
      u.includes("udemy") || u.includes("hackerrank") || u.includes("drive.google")
    );

    console.log("[ResumeParser] Profile URLs resolved:", { githubProfile, linkedinProfile, leetcodeProfile });
    console.log("[ResumeParser] Repo URLs:", githubRepos);

    // ── 6. Build smart URL hint for Gemini ────────────────────────────────────
    let urlHint = "";
    const hintParts: string[] = [];
    if (githubProfile)  hintParts.push(`GITHUB PROFILE:\n  → ${githubProfile}\n  Put in: personalInfo.github`);
    if (githubRepos.length) hintParts.push(`GITHUB REPO LINKS (${githubRepos.length} found — assign each to the matching project):\n${githubRepos.map((u) => `  → ${u}`).join("\n")}\n  Put in: projects[matching project by name].githubUrl`);
    if (linkedinProfile) hintParts.push(`LINKEDIN PROFILE:\n  → ${linkedinProfile}\n  Put in: personalInfo.linkedin`);
    if (leetcodeProfile) hintParts.push(`LEETCODE PROFILE:\n  → ${leetcodeProfile}\n  Put in: personalInfo.leetcode`);
    if (liveLinks.length) hintParts.push(`LIVE/DEMO SITE LINKS:\n${liveLinks.map((u) => `  → ${u}`).join("\n")}\n  Put in: projects[matching project by name].liveUrl`);
    if (certLinks.length) hintParts.push(`CERTIFICATE LINKS:\n${certLinks.map((u) => `  → ${u}`).join("\n")}\n  Put in: certifications[matching cert].certificateUrl`);

    if (hintParts.length > 0) {
      urlHint = `=== HYPERLINKS EXTRACTED FROM PDF (MUST USE ALL OF THESE) ===\n\n${hintParts.join("\n\n")}\n\n=== END HYPERLINKS ===`;
    }

    // ── 7. Build the extraction prompt ────────────────────────────────────────
    const prompt = `You are a world-class resume parser. Extract ALL information from this resume and return ONLY a valid JSON object.

${urlHint}

Return this EXACT JSON structure. Fill every field from the actual resume content:
{
  "personalInfo": {
    "name": "",
    "phone": "",
    "email": "",
    "github": "${githubProfile ?? ""}",
    "linkedin": "${linkedinProfile ?? ""}",
    "leetcode": "${leetcodeProfile ?? ""}"
  },
  "professionalSummary": "",
  "education": [
    { "id": "edu-1", "institution": "", "years": "", "degree": "", "location": "" }
  ],
  "experience": [
    { "id": "exp-1", "company": "", "role": "", "duration": "", "location": "", "bullets": [] }
  ],
  "skills": [
    { "id": "skill-1", "category": "Languages", "skills": [] }
  ],
  "projects": [
    { "id": "proj-1", "title": "", "year": "", "bullets": [], "techStack": [], "githubUrl": "", "liveUrl": "" }
  ],
  "certifications": [
    { "id": "cert-1", "title": "", "issuer": "", "year": "", "bullets": [], "certificateUrl": "", "badgeUrl": "" }
  ]
}

MANDATORY RULES:
1. Fill ALL fields from the actual resume content — do not leave anything empty if it exists in the document
2. The github/linkedin/leetcode fields above are pre-filled with the best URL found — keep them EXACTLY as shown unless you find a more complete URL in the document text
3. For project githubUrl: match each GitHub repo link from the HYPERLINKS section above to the correct project by comparing the repo name to the project title
4. For project liveUrl: match each live site link to the correct project similarly
5. All URLs must start with https:// — add prefix if missing
6. Use "" for missing strings, [] for missing arrays
7. Extract ALL experience entries (internships, part-time, full-time, freelance) — do NOT skip any
8. Each bullet point = separate string in the array
9. techStack = array of individual technology names (not one long string)
10. Group skills by category (Languages, Backend, Frontend, Tools, etc.)

Return ONLY the raw JSON. No markdown. No explanation. No \`\`\`json wrapper.`;

    // ── 7. Call Gemini with the PDF bytes (native visual reading) ─────────────
    const parts: any[] = [];
    if (isPdf) {
      parts.push({ inlineData: { mimeType: "application/pdf", data: req.file.buffer.toString("base64") } });
    } else {
      parts.push({ text: `RESUME CONTENT:\n${rawText}` });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
      config: { temperature: 0.05 },
    });

    // ── 8. Parse Gemini response ───────────────────────────────────────────────
    let jsonStr = (response.text ?? "{}").trim();
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
    const fb = jsonStr.indexOf("{");
    const lb = jsonStr.lastIndexOf("}");
    if (fb !== -1 && lb !== -1) jsonStr = jsonStr.substring(fb, lb + 1);

    const parsed = JSON.parse(jsonStr);

    // ── 9. Ensure https:// on all URL fields ──────────────────────────────────
    const toHttps = (url: string): string => {
      if (!url?.trim()) return "";
      const u = url.trim();
      return u.startsWith("http://") || u.startsWith("https://") ? u : `https://${u}`;
    };

    if (parsed.personalInfo) {
      parsed.personalInfo.github   = toHttps(parsed.personalInfo.github   ?? "");
      parsed.personalInfo.linkedin = toHttps(parsed.personalInfo.linkedin ?? "");
      parsed.personalInfo.leetcode = toHttps(parsed.personalInfo.leetcode ?? "");
    }
    if (Array.isArray(parsed.projects)) {
      parsed.projects = parsed.projects.map((p: any) => ({
        ...p,
        githubUrl: toHttps(p.githubUrl ?? ""),
        liveUrl:   toHttps(p.liveUrl   ?? ""),
      }));
    }
    if (Array.isArray(parsed.certifications)) {
      parsed.certifications = parsed.certifications.map((c: any) => ({
        ...c,
        certificateUrl: toHttps(c.certificateUrl ?? ""),
        badgeUrl:       toHttps(c.badgeUrl       ?? ""),
      }));
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("Parse Resume Error:", error);
    res.status(500).json({ error: error?.message ?? "Failed to parse resume." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Self-ping to keep Render free tier alive
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/ping", (_req, res) => res.status(200).send("pong"));

const PING_INTERVAL = 10 * 60 * 1000;
setInterval(() => {
  const url = process.env.APP_URL || "https://resume-ai-spark.onrender.com";
  fetch(`${url}/api/ping`)
    .then((r) => console.log(`[Self-Ping] ${url} → ${r.status}`))
    .catch((e) => console.error("[Self-Ping] Failed:", e.message));
}, PING_INTERVAL);

// ─────────────────────────────────────────────────────────────────────────────
// Vite dev middleware / static production serving
// ─────────────────────────────────────────────────────────────────────────────
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running at http://0.0.0.0:${PORT}`));
};

startServer();
