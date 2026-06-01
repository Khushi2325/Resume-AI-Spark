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

const getFriendlyErrorMessage = (error: any): string => {
  const errMsg = error?.message || String(error);
  
  if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("Quota exceeded")) {
    return "The AI parser is temporarily busy due to Google API rate limits. Please wait a few seconds and try uploading again.";
  }
  
  if (errMsg.includes("API_KEY_INVALID") || errMsg.includes("api key") || errMsg.includes("not valid")) {
    return "The configured Gemini API key is invalid or expired. Please check your .env configuration.";
  }

  try {
    const parsed = JSON.parse(errMsg);
    if (parsed?.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // Ignore JSON parsing failure
  }

  return errMsg || "An unexpected error occurred while parsing the resume with Gemini AI.";
};

const extractName = (text: string): string => {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 10)) {
    if (line.includes("@") || line.includes("http") || line.includes("www") || line.includes(".com") || line.includes("|")) continue;
    if (/[0-9]/.test(line) && line.length < 15) continue;
    const cleanLine = line.replace(/^[•\-\*]\s*/, "").trim();
    const words = cleanLine.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      const isCapitalized = words.every(w => /^[A-Z]/.test(w) || w.length === 1);
      if (isCapitalized) return cleanLine;
    }
  }
  return "";
};

const extractEmail = (text: string): string => {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : "";
};

const extractPhone = (text: string): string => {
  const match = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{4}/);
  if (match) return match[0].trim();
  const match2 = text.match(/\+?\d{10,13}/);
  return match2 ? match2[0].trim() : "";
};

interface ResumeData {
  isFallback: boolean;
  personalInfo: {
    name: string;
    phone: string;
    email: string;
    github: string;
    linkedin: string;
    leetcode: string;
  };
  professionalSummary: string;
  education: Array<{
    id: string;
    institution: string;
    years: string;
    degree: string;
    location: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    role: string;
    duration: string;
    location: string;
    bullets: string[];
  }>;
  skills: Array<{
    id: string;
    category: string;
    skills: string[];
  }>;
  projects: Array<{
    id: string;
    title: string;
    year: string;
    bullets: string[];
    techStack: string[];
    githubUrl: string;
    liveUrl: string;
  }>;
  certifications: Array<{
    id: string;
    title: string;
    issuer: string;
    year: string;
    bullets: string[];
    certificateUrl: string;
    badgeUrl: string;
  }>;
}

const cleanMarkdownLinks = (text: string): { cleanText: string; urls: string[] } => {
  const urls: string[] = [];
  const cleanText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    urls.push(url.trim());
    return linkText;
  });
  return { cleanText, urls };
};

const normalizeHeader = (text: string): string => {
  return text.toLowerCase()
    .replace(/[&:\(\)]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const isFooterOrNoise = (line: string): boolean => {
  const clean = line.trim();
  if (!clean) return true;
  if (/^--\s*\d+\s*of\s*\d+\s*--$/i.test(clean)) return true;
  if (/^page\s*\d+\s*of\s*\d+$/i.test(clean)) return true;
  if (/^\d+\s*\/\s*\d+$/i.test(clean)) return true;
  return false;
};

function parseResumeLocally(rawText: string, allUrls: string[]): ResumeData {
  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);

  // 1. Identify section boundaries
  const headers = {
    summary: ["summary", "objective", "professional summary", "about", "about me", "profile"],
    education: ["education", "academic background", "academics"],
    experience: ["experience", "work experience", "employment", "professional experience", "work history"],
    skills: ["skills", "technical skills", "key skills", "languages and tools", "technical expertise"],
    projects: ["projects", "personal projects", "academic projects", "key projects"],
    certifications: ["certifications", "achievements", "awards", "certifications achievements", "certificates"]
  };

  const sectionStarts: Array<{ section: string; index: number }> = [];
  for (let i = 0; i < lines.length; i++) {
    const lineNorm = normalizeHeader(lines[i]);
    
    // Check if the line matches any section headers exactly
    let matchedSection: string | null = null;
    for (const [section, keywords] of Object.entries(headers)) {
      if (keywords.includes(lineNorm)) {
        matchedSection = section;
        break;
      }
    }

    if (matchedSection) {
      sectionStarts.push({ section: matchedSection, index: i });
    }
  }

  // Sort starts by index
  sectionStarts.sort((a, b) => a.index - b.index);

  // Get lines for a specific section
  const getSectionLines = (sectionName: string): string[] => {
    const startIdx = sectionStarts.findIndex(s => s.section === sectionName);
    if (startIdx === -1) return [];
    
    const start = sectionStarts[startIdx].index + 1;
    const end = startIdx + 1 < sectionStarts.length ? sectionStarts[startIdx + 1].index : lines.length;
    return lines.slice(start, end);
  };

  // 2. Parse Profile URL links
  const getPath = (url: string, domain: string): string => {
    const after = url.toLowerCase().split(domain)[1] ?? "";
    return after.replace(/^\//, "");
  };

  // Extract from markdown links first
  const mdUrls: string[] = [];
  rawText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    mdUrls.push(url.trim());
    return linkText;
  });

  const mergedUrls = [...new Set([...allUrls, ...mdUrls])];

  let githubProfile = mergedUrls.find((u) => {
    if (!u.includes("github.com")) return false;
    const path = getPath(u, "github.com");
    return path.length >= 2 && !path.includes("/");
  });
  if (!githubProfile) {
    const tm = rawText.match(/github\.com\/([a-zA-Z0-9_-]{2,39})(?![/\w])/i);
    if (tm) githubProfile = `https://github.com/${tm[1]}`;
  }

  const githubRepos = mergedUrls.filter((u) => {
    if (!u.includes("github.com")) return false;
    const path = getPath(u, "github.com");
    return path.includes("/") && path.split("/").filter(Boolean).length >= 2;
  });

  let linkedinProfile = mergedUrls.find((u) => u.includes("linkedin.com/in/"));
  if (!linkedinProfile) {
    linkedinProfile = mergedUrls.find((u) => {
      if (!u.includes("linkedin.com")) return false;
      return getPath(u, "linkedin.com").length >= 2;
    });
  }
  if (!linkedinProfile) {
    const tm = rawText.match(/linkedin\.com\/(in\/[a-zA-Z0-9_-]+)/i);
    if (tm) linkedinProfile = `https://www.linkedin.com/${tm[1]}`;
  }

  let leetcodeProfile = mergedUrls.find((u) => {
    if (!u.includes("leetcode.com")) return false;
    return getPath(u, "leetcode.com").length >= 2;
  });
  if (!leetcodeProfile) {
    const tm = rawText.match(/leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]{2,})/i);
    if (tm) leetcodeProfile = `https://leetcode.com/${tm[1]}`;
  }

  // 3. Parse Summary Section
  const summaryLines = getSectionLines("summary")
    .filter(l => !isFooterOrNoise(l))
    .map(l => cleanMarkdownLinks(l).cleanText);
  const professionalSummary = summaryLines.join(" ");

  // 4. Parse Education Section
  const eduLines = getSectionLines("education").filter(l => !isFooterOrNoise(l));
  const education: ResumeData["education"] = [];
  let eduId = 1;
  
  // Date range regex matching: "2023 – Present", "MAR-2023", "March 2023", etc.
  const dateRangeRegex = /\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-–\s\d]*)?\b(19|20)\d{2}\s*(?:–|-|to)?\s*(?:Present|\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-–\s]*)?\b(19|20)\d{2})?\b/i;

  for (let i = 0; i < eduLines.length; i++) {
    const line = eduLines[i];
    const yearMatch = line.match(dateRangeRegex);
    
    if (yearMatch) {
      const year = yearMatch[0].trim();
      // Clean institution: remove year/date part, and any trailing dashes, commas, spaces
      let inst = line.replace(yearMatch[0], "")
        .replace(/[,-\s–]+$/, "")
        .trim();
      
      const { cleanText: cleanInst } = cleanMarkdownLinks(inst);
      
      // Look at next lines to find degree and location
      let degree = "";
      let location = "";
      
      if (i + 1 < eduLines.length) {
        const nextLine = eduLines[i + 1];
        const nextLineHasYear = nextLine.match(dateRangeRegex);
        const nextLineNorm = normalizeHeader(nextLine);
        
        // If the next line doesn't start another section or have a year, it's part of this education entry
        let isSectionHeader = false;
        for (const keywords of Object.values(headers)) {
          if (keywords.includes(nextLineNorm)) {
            isSectionHeader = true;
            break;
          }
        }

        if (!nextLineHasYear && !isSectionHeader) {
          const { cleanText: cleanDegree } = cleanMarkdownLinks(nextLine);
          degree = cleanDegree;
          
          // Check if there is location on the right side of degree or institution
          const rightPartMatch = cleanDegree.match(/\s{2,}([a-zA-Z\s,]+)$/);
          if (rightPartMatch) {
            location = rightPartMatch[1].trim();
            degree = cleanDegree.replace(rightPartMatch[0], "").trim();
          }
          i++;
        }
      }
      
      education.push({
        id: `edu-${eduId++}`,
        institution: cleanInst,
        years: year,
        degree: degree,
        location: location
      });
    }
  }

  // 5. Parse Skills Section
  const skillLines = getSectionLines("skills").filter(l => !isFooterOrNoise(l));
  const skills: ResumeData["skills"] = [];
  let skillId = 1;

  for (const line of skillLines) {
    const { cleanText: cleanLine } = cleanMarkdownLinks(line);
    let cat = "";
    let listStr = "";
    
    if (cleanLine.includes(":")) {
      const parts = cleanLine.split(":");
      cat = parts[0].trim();
      listStr = parts.slice(1).join(":").trim();
    } else if (cleanLine.includes(" - ")) {
      const parts = cleanLine.split(" - ");
      cat = parts[0].trim();
      listStr = parts.slice(1).join(" - ").trim();
    } else {
      // No separator, put all under a generic category or skip if it's too short
      if (cleanLine.length > 5) {
        cat = "Skills";
        listStr = cleanLine;
      }
    }
    
    if (cat && listStr) {
      const list = listStr.split(",").map(s => s.trim()).filter(Boolean);
      
      // Filter out noise
      if (cat.toLowerCase().includes("profile") || cat.toLowerCase().includes("certificate")) {
        continue;
      }
      
      // Check if this category already exists
      const existing = skills.find(s => s.category.toLowerCase() === cat.toLowerCase());
      if (existing) {
        existing.skills = [...new Set([...existing.skills, ...list])];
      } else {
        skills.push({
          id: `skill-${skillId++}`,
          category: cat,
          skills: list
        });
      }
    }
  }

  // 6. Parse Projects Section
  const projLines = getSectionLines("projects").filter(l => !isFooterOrNoise(l));
  const projects: ResumeData["projects"] = [];
  let projId = 1;
  let currentProj: any = null;

  for (let i = 0; i < projLines.length; i++) {
    const line = projLines[i];
    
    // Check if line contains a year
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("–") || line.startsWith("*");
    const isLinkLine = line.toLowerCase().includes("github:") || line.toLowerCase().includes("live:") || 
                       line.toLowerCase().includes("website:") || line.toLowerCase().includes("repository:") ||
                       line.toLowerCase().includes("live website:");

    // If it contains a year and is not a bullet point or link line, it's a project header!
    if (yearMatch && !isBullet && !isLinkLine) {
      if (currentProj) {
        projects.push(currentProj);
      }
      
      const year = yearMatch[0];
      let title = line.replace(year, "")
        .replace(/[,-\s–]+$/, "")
        .trim();
      
      const { cleanText: cleanTitle } = cleanMarkdownLinks(title);
      
      currentProj = {
        id: `proj-${projId++}`,
        title: cleanTitle,
        year: year,
        bullets: [],
        techStack: [],
        githubUrl: "",
        liveUrl: ""
      };
    } else if (currentProj) {
      const { cleanText, urls } = cleanMarkdownLinks(line);
      
      // Check if there are markdown links
      if (urls.length > 0) {
        for (const u of urls) {
          if (u.includes("github.com")) {
            currentProj.githubUrl = u;
          } else {
            currentProj.liveUrl = u;
          }
        }
      }
      
      if (isLinkLine) {
        // Skip adding the link indicator text as a bullet
        continue;
      }
      
      // Add as bullet point
      const bulletText = cleanText.replace(/^[•\-\*]\s*/, "").trim();
      if (bulletText) {
        currentProj.bullets.push(bulletText);

        // Extract tech stack from bullet points
        const knownTech = ["React", "Node.js", "Express", "Python", "Java", "NLP", "OpenCV", "TensorFlow", "MongoDB", "PostgreSQL", "HTML", "CSS", "JavaScript"];
        for (const tech of knownTech) {
          const regex = new RegExp(`\\b${tech}\\b`, "i");
          if (regex.test(bulletText) && !currentProj.techStack.includes(tech)) {
            currentProj.techStack.push(tech);
          }
        }
      }
    }
  }
  
  if (currentProj) {
    projects.push(currentProj);
  }

  // Assign project github/live URLs from allUrls if not found directly
  for (const proj of projects) {
    if (!proj.githubUrl) {
      const cleanTitle = proj.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const url of githubRepos) {
        const parts = url.toLowerCase().split("/");
        const repoName = (parts[parts.length - 1] ?? "").replace(/[^a-z0-9]/g, "");
        if (cleanTitle.includes(repoName) || repoName.includes(cleanTitle)) {
          proj.githubUrl = url;
          break;
        }
      }
    }
  }

  // 7. Parse Experience Section
  const expLines = getSectionLines("experience").filter(l => !isFooterOrNoise(l));
  const experience: ResumeData["experience"] = [];
  let expId = 1;
  let currentExp: any = null;

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i];
    const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("–") || line.startsWith("*");
    const yearMatch = line.match(dateRangeRegex);
    
    if (yearMatch && !isBullet) {
      if (currentExp) {
        experience.push(currentExp);
      }
      
      const duration = yearMatch[0].trim();
      let company = line.replace(yearMatch[0], "")
        .replace(/[,-\s–]+$/, "")
        .trim();
      
      const { cleanText: cleanCompany } = cleanMarkdownLinks(company);
      
      currentExp = {
        id: `exp-${expId++}`,
        company: cleanCompany,
        role: "",
        duration: duration,
        location: "",
        bullets: []
      };
      
      if (i + 1 < expLines.length) {
        const nextLine = expLines[i + 1];
        const nextLineHasYear = nextLine.match(dateRangeRegex);
        
        if (!nextLine.startsWith("•") && !nextLine.startsWith("-") && !nextLineHasYear) {
          const { cleanText: cleanRole } = cleanMarkdownLinks(nextLine);
          currentExp.role = cleanRole;
          const rightPartMatch = cleanRole.match(/\s{2,}([a-zA-Z\s,]+)$/);
          if (rightPartMatch) {
            currentExp.location = rightPartMatch[1].trim();
            currentExp.role = cleanRole.replace(rightPartMatch[0], "").trim();
          }
          i++;
        }
      }
    } else if (currentExp) {
      const { cleanText } = cleanMarkdownLinks(line);
      const bulletText = cleanText.replace(/^[•\-\*]\s*/, "").trim();
      if (bulletText) currentExp.bullets.push(bulletText);
    }
  }
  if (currentExp) {
    experience.push(currentExp);
  }

  // 8. Parse Certifications Section
  const certLines = getSectionLines("certifications").filter(l => !isFooterOrNoise(l));
  const certifications: ResumeData["certifications"] = [];
  let certId = 1;
  let currentCert: any = null;
  let wasPrevLink = false;

  for (let i = 0; i < certLines.length; i++) {
    const line = certLines[i];
    const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("–") || line.startsWith("*");
    const { cleanText: cleanLine, urls } = cleanMarkdownLinks(line);
    
    const isLinkLine = cleanLine.toLowerCase().startsWith("view certificate") || 
                       cleanLine.toLowerCase().startsWith("view badge") || 
                       cleanLine.toLowerCase().startsWith("profile:") || 
                       cleanLine.toLowerCase().startsWith("certificate:") ||
                       cleanLine.toLowerCase().startsWith("badge:") ||
                       urls.length > 0;
                       
    const yearMatch = cleanLine.match(/\b(19|20)\d{2}\b/);
    
    // We start a new cert if it's a new entry (not bullet, not link, and either has year, no currentCert, or previous line was link line)
    if (!isBullet && !isLinkLine && (yearMatch || !currentCert || wasPrevLink)) {
      if (currentCert) {
        certifications.push(currentCert);
      }
      
      let title = cleanLine;
      let year = "";
      if (yearMatch) {
        year = yearMatch[0];
        title = cleanLine.replace(year, "")
          .replace(/[,-\s–]+$/, "")
          .trim();
      }
      
      currentCert = {
        id: `cert-${certId++}`,
        title: title,
        issuer: "",
        year: year,
        bullets: [],
        certificateUrl: "",
        badgeUrl: ""
      };
      
      if (title.includes(" — ")) {
        const parts = title.split(" — ");
        currentCert.title = parts[0].trim();
        currentCert.issuer = parts[1].trim();
      } else if (title.includes(" - ")) {
        const parts = title.split(" - ");
        currentCert.title = parts[0].trim();
        currentCert.issuer = parts[1].trim();
      }
      wasPrevLink = false;
    } else if (currentCert) {
      if (isLinkLine) {
        wasPrevLink = true;
        currentCert._linkText = (currentCert._linkText || "") + " " + cleanLine;
        for (const u of urls) {
          if (u.includes("credly")) {
            currentCert.badgeUrl = u;
          } else {
            currentCert.certificateUrl = u;
          }
        }
      } else {
        wasPrevLink = false;
        const bulletText = cleanLine.replace(/^[•\-\*]\s*/, "").trim();
        if (bulletText) currentCert.bullets.push(bulletText);
      }
    }
  }
  if (currentCert) {
    certifications.push(currentCert);
  }

  // Fallback certification URL mapping from allUrls
  const assignedUrls = new Set<string>();
  for (const proj of projects) {
    if (proj.githubUrl) assignedUrls.add(proj.githubUrl);
    if (proj.liveUrl) assignedUrls.add(proj.liveUrl);
  }
  for (const cert of certifications) {
    if (cert.certificateUrl) assignedUrls.add(cert.certificateUrl);
    if (cert.badgeUrl) assignedUrls.add(cert.badgeUrl);
  }

  const findUnassignedUrl = (predicate: (u: string) => boolean): string => {
    const found = mergedUrls.find(u => !assignedUrls.has(u) && predicate(u));
    if (found) {
      assignedUrls.add(found);
    }
    return found || "";
  };

  for (const cert of certifications) {
    const certMeta = cert as typeof cert & { _linkText?: string };
    const certRawText = (cert.title + " " + cert.bullets.join(" ") + " " + (certMeta._linkText || "")).toLowerCase();
    
    if (!cert.badgeUrl && certRawText.includes("badge")) {
      cert.badgeUrl = findUnassignedUrl(u => u.includes("credly") || u.includes("badge"));
    }
    if (!cert.certificateUrl && (certRawText.includes("certificate") || certRawText.includes("cert"))) {
      cert.certificateUrl = findUnassignedUrl(u => u.includes("drive.google") || u.includes("drive") || u.includes("cert"));
    }
    
    delete certMeta._linkText;
  }

  return {
    isFallback: false,
    personalInfo: {
      name: extractName(rawText),
      phone: extractPhone(rawText),
      email: extractEmail(rawText),
      github: githubProfile ?? "",
      linkedin: linkedinProfile ?? "",
      leetcode: leetcodeProfile ?? ""
    },
    professionalSummary,
    education,
    experience,
    skills,
    projects,
    certifications
  };
}

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
      model: "gemini-1.5-flash",
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
    res.status(500).json({ error: getFriendlyErrorMessage(error) });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Resume PDF Parser
// ─────────────────────────────────────────────────────────────────────────────
app.post("/api/template-recommendations", async (req, res) => {
  try {
    const { resume, purpose } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_ACTUAL_GEMINI_API_KEY_HERE" || apiKey.includes("YOUR_ACTUAL")) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
    }

    const prompt = `Act as a resume template selector using lightweight RAG.
Known templates:
- classic: ATS-friendly academic/professional single column
- two-column: technical, portfolio-heavy, skills-forward
- bold-banner: creative, leadership, public-facing, arts/media
- tabular: research, teaching, academic credentials
- cv-academic: research professionals, professors, publications, grants
- minimal: conservative, school teachers, public sector, compact one-page

User purpose: ${purpose || "general job search"}
Resume data: ${JSON.stringify(resume)}

Return only valid JSON in this shape:
{"recommendations":[{"layout":"classic","score":90,"reason":"short plain-English reason"}]}
Use exactly three recommendations. layout must be one of classic, two-column, bold-banner, tabular, cv-academic, minimal.`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.25 },
    });

    const raw = response.text || "";
    const match = raw.match(/\{[\s\S]*\}/);
    res.json(match ? JSON.parse(match[0]) : { recommendations: [] });
  } catch (error: any) {
    console.error("Template Recommendation Error:", error);
    res.status(500).json({ error: getFriendlyErrorMessage(error) });
  }
});

app.post("/api/resume-quality", async (req, res) => {
  try {
    const { resume, purpose } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_ACTUAL_GEMINI_API_KEY_HERE" || apiKey.includes("YOUR_ACTUAL")) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
    }

    const prompt = `You are an ATS and resume language evaluator.
Evaluate this resume for the user's purpose: ${purpose || "general applications"}.
Score each from 1 to 100:
- parsability: ATS readability, clear sections, contact links, bullets, dates
- grammar: professional grammar and technical wording accuracy
- repetition: high score means low repetition and varied verbs/phrasing

Resume data: ${JSON.stringify(resume)}

Return only valid JSON:
{"report":{"parsability":85,"grammar":90,"repetition":78,"summary":"one sentence","fixes":["specific fix 1","specific fix 2","specific fix 3"]}}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.2 },
    });

    const raw = response.text || "";
    const match = raw.match(/\{[\s\S]*\}/);
    res.json(match ? JSON.parse(match[0]) : { report: null });
  } catch (error: any) {
    console.error("Resume Quality Error:", error);
    res.status(500).json({ error: getFriendlyErrorMessage(error) });
  }
});

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

    const parsed = parseResumeLocally(rawText, allUrls);

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
    res.status(500).json({ error: getFriendlyErrorMessage(error) });
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
