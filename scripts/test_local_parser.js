import { PDFParse } from "pdf-parse";
import fs from "fs";

// Helper regex extractors
const extractName = (text) => {
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

const extractEmail = (text) => {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : "";
};

const extractPhone = (text) => {
  const match = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{4}/);
  if (match) return match[0].trim();
  const match2 = text.match(/\+?\d{10,13}/);
  return match2 ? match2[0].trim() : "";
};

// URL matcher
const matchRepoUrl = (title, repos) => {
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const url of repos) {
    const parts = url.toLowerCase().split("/");
    const repoName = (parts[parts.length - 1] ?? "").replace(/[^a-z0-9]/g, "");
    if (cleanTitle.includes(repoName) || repoName.includes(cleanTitle)) {
      return url;
    }
  }
  return "";
};

function parseResumeLocally(rawText, allUrls) {
  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);

  // 1. Identify section boundaries
  const headers = {
    summary: ["summary", "objective", "professional summary", "about", "about me", "profile"],
    education: ["education", "academic background", "academics"],
    experience: ["experience", "work experience", "employment", "professional experience", "work history"],
    skills: ["skills", "technical skills", "key skills", "languages and tools", "technical expertise"],
    projects: ["projects", "personal projects", "academic projects", "key projects"],
    certifications: ["certifications", "achievements", "awards", "certifications & achievements", "certificates"]
  };

  const sectionStarts = [];
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase().replace(/[:&]/g, " ").trim();
    
    // Check if the line matches any section headers
    let matchedSection = null;
    for (const [section, keywords] of Object.entries(headers)) {
      if (keywords.includes(lineLower)) {
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
  const getSectionLines = (sectionName) => {
    const startIdx = sectionStarts.findIndex(s => s.section === sectionName);
    if (startIdx === -1) return [];
    
    const start = sectionStarts[startIdx].index + 1;
    const end = startIdx + 1 < sectionStarts.length ? sectionStarts[startIdx + 1].index : lines.length;
    return lines.slice(start, end);
  };

  // 2. Parse Profile URL links
  const getPath = (url, domain) => {
    const after = url.toLowerCase().split(domain)[1] ?? "";
    return after.replace(/^\//, "");
  };

  let githubProfile = allUrls.find((u) => {
    if (!u.includes("github.com")) return false;
    const path = getPath(u, "github.com");
    return path.length >= 2 && !path.includes("/");
  });
  if (!githubProfile) {
    const tm = rawText.match(/github\.com\/([a-zA-Z0-9_-]{2,39})(?![/\w])/i);
    if (tm) githubProfile = `https://github.com/${tm[1]}`;
  }

  const githubRepos = allUrls.filter((u) => {
    if (!u.includes("github.com")) return false;
    const path = getPath(u, "github.com");
    return path.includes("/") && path.split("/").filter(Boolean).length >= 2;
  });

  let linkedinProfile = allUrls.find((u) => u.includes("linkedin.com/in/"));
  if (!linkedinProfile) {
    linkedinProfile = allUrls.find((u) => {
      if (!u.includes("linkedin.com")) return false;
      return getPath(u, "linkedin.com").length >= 2;
    });
  }
  if (!linkedinProfile) {
    const tm = rawText.match(/linkedin\.com\/(in\/[a-zA-Z0-9_-]+)/i);
    if (tm) linkedinProfile = `https://www.linkedin.com/${tm[1]}`;
  }

  let leetcodeProfile = allUrls.find((u) => {
    if (!u.includes("leetcode.com")) return false;
    return getPath(u, "leetcode.com").length >= 2;
  });
  if (!leetcodeProfile) {
    const tm = rawText.match(/leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]{2,})/i);
    if (tm) leetcodeProfile = `https://leetcode.com/${tm[1]}`;
  }

  const liveLinks = allUrls.filter((u) =>
    u.includes("vercel.app") || u.includes("netlify.app") ||
    u.includes("railway.app") || u.includes("render.com") || u.includes("herokuapp.com")
  );
  const certLinks = allUrls.filter((u) =>
    u.includes("credly") || u.includes("coursera") ||
    u.includes("udemy") || u.includes("hackerrank") || u.includes("drive.google")
  );

  // 3. Parse Summary Section
  const summaryLines = getSectionLines("summary");
  const professionalSummary = summaryLines.join(" ");

  // 4. Parse Education Section
  const eduLines = getSectionLines("education");
  const education = [];
  let eduId = 1;
  
  for (let i = 0; i < eduLines.length; i++) {
    const line = eduLines[i];
    // Find year matching pattern: 2023, 2023 - Present, etc.
    const yearMatch = line.match(/\b(19|20)\d{2}\s*(?:–|-|to)?\s*(?:Present|\b(19|20)\d{2})?\b/i);
    
    if (yearMatch) {
      const year = yearMatch[0].trim();
      const inst = line.replace(year, "").replace(/\s*–\s*$/, "").trim();
      
      // Look at next lines to find degree and location
      let degree = "";
      let location = "";
      
      if (i + 1 < eduLines.length) {
        const nextLine = eduLines[i + 1];
        if (!nextLine.match(/\b(19|20)\d{2}\b/)) {
          degree = nextLine;
          // Check if there is location on the right side of degree or institution
          const rightPartMatch = nextLine.match(/\s{2,}([a-zA-Z\s,]+)$/);
          if (rightPartMatch) {
            location = rightPartMatch[1].trim();
            degree = nextLine.replace(rightPartMatch[0], "").trim();
          }
          i++;
        }
      }
      
      education.push({
        id: `edu-${eduId++}`,
        institution: inst,
        years: year,
        degree: degree,
        location: location
      });
    }
  }

  // 5. Parse Skills Section
  const skillLines = getSectionLines("skills");
  const skills = [];
  let skillId = 1;

  for (const line of skillLines) {
    if (line.includes(":")) {
      const parts = line.split(":");
      const cat = parts[0].trim();
      const list = parts[1].split(",").map(s => s.trim()).filter(Boolean);
      
      // Filter out LeetCode and Certificate noise if they get classified under skills
      if (cat.toLowerCase().includes("profile") || cat.toLowerCase().includes("certificate")) {
        continue;
      }
      
      skills.push({
        id: `skill-${skillId++}`,
        category: cat,
        skills: list
      });
    }
  }

  // 6. Parse Projects Section
  const projLines = getSectionLines("projects");
  const projects = [];
  let projId = 1;
  let currentProj = null;

  for (let i = 0; i < projLines.length; i++) {
    const line = projLines[i];
    
    // Check if line contains a year
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("–") || line.startsWith("*");
    const isLinkLine = line.toLowerCase().startsWith("github:") || line.toLowerCase().startsWith("live:") || 
                       line.toLowerCase().startsWith("website:") || line.toLowerCase().startsWith("repository:");

    // If it contains a year and is not a bullet point, it's a project header!
    if (yearMatch && !isBullet && !isLinkLine) {
      if (currentProj) {
        projects.push(currentProj);
      }
      
      const year = yearMatch[0];
      const title = line.replace(year, "").replace(/\s*–\s*$/, "").replace(/\s*-\s*$/, "").trim();
      
      currentProj = {
        id: `proj-${projId++}`,
        title: title,
        year: year,
        bullets: [],
        techStack: [],
        githubUrl: matchRepoUrl(title, githubRepos),
        liveUrl: ""
      };

      // Match live URLs based on keywords in title
      const cleanTitle = title.toLowerCase();
      const matchedLive = liveLinks.find(u => {
        const domain = u.split(".")[0]?.replace("https://", "")?.replace("http://", "");
        return domain && cleanTitle.includes(domain);
      });
      if (matchedLive) {
        currentProj.liveUrl = matchedLive;
      }
    } else if (currentProj) {
      if (isLinkLine) {
        // Just link helper, skip
        continue;
      }
      // Add as bullet point
      const bulletText = line.replace(/^[•\-\*]\s*/, "").trim();
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
  
  if (currentProj) {
    projects.push(currentProj);
  }

  // 7. Parse Experience Section
  const expLines = getSectionLines("experience");
  const experience = [];
  let expId = 1;
  let currentExp = null;

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i];
    const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("–") || line.startsWith("*");
    const yearMatch = line.match(/\b(19|20)\d{2}\s*(?:–|-|to)?\s*(?:Present|\b(19|20)\d{2})?\b/i);
    
    if (yearMatch && !isBullet) {
      if (currentExp) {
        experience.push(currentExp);
      }
      
      const duration = yearMatch[0].trim();
      const company = line.replace(duration, "").replace(/\s*–\s*$/, "").trim();
      
      currentExp = {
        id: `exp-${expId++}`,
        company: company,
        role: "",
        duration: duration,
        location: "",
        bullets: []
      };
      
      if (i + 1 < expLines.length && !expLines[i + 1].startsWith("•")) {
        const nextLine = expLines[i + 1];
        currentExp.role = nextLine;
        const rightPartMatch = nextLine.match(/\s{2,}([a-zA-Z\s,]+)$/);
        if (rightPartMatch) {
          currentExp.location = rightPartMatch[1].trim();
          currentExp.role = nextLine.replace(rightPartMatch[0], "").trim();
        }
        i++;
      }
    } else if (currentExp) {
      currentExp.bullets.push(line.replace(/^[•\-\*]\s*/, "").trim());
    }
  }
  if (currentExp) {
    experience.push(currentExp);
  }

  // 8. Parse Certifications Section
  const certLines = getSectionLines("certifications");
  const certifications = [];
  let certId = 1;
  let currentCert = null;

  for (let i = 0; i < certLines.length; i++) {
    const line = certLines[i];
    const isBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("–") || line.startsWith("*") || line.toLowerCase().startsWith("certificate:");
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    
    if (yearMatch && !isBullet) {
      if (currentCert) {
        certifications.push(currentCert);
      }
      
      const year = yearMatch[0];
      const title = line.replace(year, "").replace(/\s*–\s*$/, "").replace(/\s*-\s*$/, "").trim();
      
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
      
      const cleanTitle = title.toLowerCase();
      const matchedCertUrl = certLinks.find(u => {
        if (u.includes("credly")) return false;
        return cleanTitle.includes("hackerrank") && u.includes("hackerrank") ||
               cleanTitle.includes("coursera") && u.includes("coursera") ||
               u.includes("drive.google");
      });
      if (matchedCertUrl) {
        currentCert.certificateUrl = matchedCertUrl;
      }
      
      const matchedBadgeUrl = certLinks.find(u => u.includes("credly"));
      if (matchedBadgeUrl && cleanTitle.includes("servicenow")) {
        currentCert.badgeUrl = matchedBadgeUrl;
      }
    } else if (currentCert) {
      if (line.toLowerCase().startsWith("certificate:")) {
        const cleanUrl = line.split(/certificate:/i)[1]?.trim() || "";
        if (cleanUrl) currentCert.certificateUrl = cleanUrl;
      } else {
        currentCert.bullets.push(line.replace(/^[•\-\*]\s*/, "").trim());
      }
    }
  }
  if (currentCert) {
    certifications.push(currentCert);
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

async function test() {
  const buffer = fs.readFileSync("C:/Users/romit/OneDrive/Desktop/MAIN RESUME.pdf");
  const parser = new PDFParse({ data: buffer });
  const textResult = await parser.getText();
  const rawText = textResult.text ?? "";
  
  const info = await parser.getInfo({ parsePageInfo: true });
  const allUrls = [];
  for (const page of info.pages ?? []) {
    for (const linkObj of page.links ?? []) {
      if (linkObj.url) allUrls.push(linkObj.url.trim());
    }
  }
  await parser.destroy();

  const parsed = parseResumeLocally(rawText, allUrls);
  console.log("--- FINAL LOCAL PARSED OBJECT ---");
  console.log(JSON.stringify(parsed, null, 2));
}

test().catch(console.error);
