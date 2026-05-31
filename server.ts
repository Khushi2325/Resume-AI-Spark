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

    // ── 1. Extract plain text via pdf-parse (for text URL scanning) ───────────
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

    // ── 2. Extract hyperlinks from PDF ANNOTATION LAYER ───────────────────────
    // PDFs store ALL clickable hyperlinks (even icon-based ones like GitHub/LinkedIn icons)
    // as /URI entries in the binary PDF structure. We extract them directly here.
    const annotationUrls: string[] = [];
    if (isPdf) {
      try {
        const pdfRaw = req.file.buffer.toString("latin1"); // binary-safe encoding

        // Standard /URI (url) pattern
        const p1 = /\/URI\s*\(([^)]+)\)/g;
        let m: RegExpExecArray | null;
        while ((m = p1.exec(pdfRaw)) !== null) {
          const u = m[1].replace(/\\\)/g, ")").trim();
          if (u.length > 5) annotationUrls.push(u);
        }

        // Hex-encoded /URI <hex> pattern
        const p2 = /\/URI\s*<([0-9a-fA-F\s]+)>/g;
        while ((m = p2.exec(pdfRaw)) !== null) {
          const hex = m[1].replace(/\s/g, "");
          let decoded = "";
          for (let i = 0; i < hex.length - 1; i += 2) {
            decoded += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
          }
          decoded = decoded.trim();
          if (decoded.startsWith("http") || decoded.includes("github") || decoded.includes("linkedin")) {
            annotationUrls.push(decoded);
          }
        }
      } catch { /* silent fail — Gemini will still read the PDF visually */ }
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

    // ── 5. Build smart URL hint for Gemini ────────────────────────────────────
    let urlHint = "";
    if (allUrls.length > 0) {
      const gh   = allUrls.filter((u) => u.includes("github.com"));
      const li   = allUrls.filter((u) => u.includes("linkedin.com"));
      const lc   = allUrls.filter((u) => u.includes("leetcode.com"));
      const live = allUrls.filter((u) =>
        u.includes("vercel.app") || u.includes("netlify.app") ||
        u.includes("railway.app") || u.includes("render.com") || u.includes("herokuapp.com")
      );
      const cert = allUrls.filter((u) =>
        u.includes("credly") || u.includes("coursera") ||
        u.includes("udemy") || u.includes("hackerrank") || u.includes("drive.google")
      );
      const other = allUrls.filter((u) => !gh.includes(u) && !li.includes(u) && !lc.includes(u) && !live.includes(u) && !cert.includes(u));

      urlHint = `
=== ALL HYPERLINKS EXTRACTED FROM THIS PDF ===
These URLs come directly from the PDF's embedded hyperlink layer (including icon-based links).
You MUST use them — place each one in the correct JSON field:

${gh.length   ? `GITHUB (${gh.length}):\n${gh.map((u) => `  → ${u}`).join("\n")}\n  → Short path (github.com/username) = personalInfo.github\n  → Repo path (github.com/user/repo) = projects[matching].githubUrl\n` : ""}${li.length   ? `LINKEDIN:\n${li.map((u) => `  → ${u}`).join("\n")}\n  → personalInfo.linkedin\n` : ""}${lc.length   ? `LEETCODE:\n${lc.map((u) => `  → ${u}`).join("\n")}\n  → personalInfo.leetcode\n` : ""}${live.length ? `LIVE/DEMO SITES:\n${live.map((u) => `  → ${u}`).join("\n")}\n  → projects[matching].liveUrl\n` : ""}${cert.length ? `CERTIFICATE LINKS:\n${cert.map((u) => `  → ${u}`).join("\n")}\n  → certifications[matching].certificateUrl\n` : ""}${other.length ? `OTHER:\n${other.map((u) => `  → ${u}`).join("\n")}\n` : ""}=== END HYPERLINKS ===
`;
    }

    // ── 6. Build the extraction prompt ────────────────────────────────────────
    const prompt = `You are a world-class resume parser. Extract ALL information from this resume and return ONLY a valid JSON object.

${urlHint}

Return this EXACT JSON structure. Replace the placeholder strings with real extracted values:
{
  "personalInfo": {
    "name": "",
    "phone": "",
    "email": "",
    "github": "${allUrls.find((u) => u.includes("github.com") && !u.split("github.com/")[1]?.includes("/")) ?? ""}",
    "linkedin": "${allUrls.find((u) => u.includes("linkedin.com")) ?? ""}",
    "leetcode": "${allUrls.find((u) => u.includes("leetcode.com")) ?? ""}"
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
1. Fill in ALL fields from the actual resume content
2. The github/linkedin/leetcode values in the template above are pre-filled hints — use them unless you find better/more complete URLs in the document
3. All URLs must start with https://
4. Use "" for missing strings, [] for missing arrays
5. Extract ALL experience entries (internships, part-time, full-time, freelance)
6. Each bullet point = separate string in array
7. techStack = array of individual technology names
8. Group skills by category

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
