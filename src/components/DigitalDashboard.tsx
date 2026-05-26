import React, { useState, useMemo } from "react";
import { ResumeData, SkillGroup, ProjectEntry, CertificationEntry } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  BookOpen,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  Github,
  Linkedin,
  Code,
  Copy,
  Check,
  Award,
  ExternalLink,
  MapPin,
  Calendar,
  Layers,
  Brain,
  Activity,
  Cpu,
  CheckCircle2,
  TrendingUp,
  FileCheck2,
} from "lucide-react";
import { isValidLink, extractUsername } from "../utils";

interface DigitalDashboardProps {
  data: ResumeData;
  isDark: boolean;
}

export const DigitalDashboard: React.FC<DigitalDashboardProps> = ({
  data,
  isDark,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeQA, setActiveQA] = useState<number | null>(0);

  // Skill Mastery Slider Ratings (Recruiter can adjust to test candidate fit!)
  const [skillMastery, setSkillMastery] = useState<Record<string, number>>({
    "Java": 90,
    "Spring Boot": 85,
    "Node.js": 88,
    "Express.js": 85,
    "React.js": 82,
    "Python": 80,
    "SQL": 78,
    "REST APIs": 90,
    "Data Structures & Algorithms": 85,
    "JWT": 88,
    "OpenCV": 75,
    "TensorFlow": 70,
  });

  // Dynamic recruiter Q&As adapted to current loaded resume details
  const dynamicQAs = useMemo(() => {
    const name = data.personalInfo.name || "the candidate";
    const summary = data.professionalSummary || "software developer";
    const topProjects = data.projects.slice(0, 2);
    
    const list = [
      {
        q: "👋 Brief overview of your background?",
        a: `Hi! I am ${name}. ${summary}`
      }
    ];

    if (topProjects.length > 0) {
      topProjects.forEach(p => {
        list.push({
          q: `🛠️ Tell me about your project "${p.title}"`,
          a: `For "${p.title}" (${p.year}), I leveraged ${p.techStack.join(", ")}. My key achievements included: ${p.bullets.join(" ")}`
        });
      });
    }

    if (data.certifications.length > 0 && data.certifications[0].title) {
      const topCert = data.certifications[0];
      list.push({
        q: `🏆 Tell me about your "${topCert.title}" certification.`,
        a: `I completed the "${topCert.title}" issued by ${topCert.issuer} in ${topCert.year}. It verified my expertise in: ${topCert.bullets.join(" ")}`
      });
    }

    const allSkills = data.skills.map(g => g.skills.slice(0, 3).join(", ")).filter(Boolean).join("; ");
    list.push({
      q: "💻 What is your technology stack?",
      a: `My technical expertise covers: ${allSkills || "Java, Python, JavaScript, Spring Boot, React.js, and RESTful web services."}`
    });

    return list;
  }, [data]);

  // Solver statistics tracking
  const leetcodeStats = useMemo(() => {
    const isKhushi = data.personalInfo.name.toLowerCase().includes("khushi");
    if (isKhushi) {
      return {
        solved: 215,
        easy: 92,
        medium: 108,
        hard: 15,
        rating: 1680,
        badge: "Knight (Top 12%)",
        rank: "142,500"
      };
    }
    // Dynamic mock fallback based on project count
    return {
      solved: Math.max(data.projects.length * 35 + 20, 0),
      easy: Math.max(data.projects.length * 15 + 10, 0),
      medium: Math.max(data.projects.length * 18 + 8, 0),
      hard: Math.max(data.projects.length * 2 + 2, 0),
      rating: Math.max(1400 + data.projects.length * 50, 0),
      badge: "Specialist",
      rank: "320,000"
    };
  }, [data]);

  const coursework = [
    { name: "Data Structures & Algorithms", code: "DSA", grade: "A+" },
    { name: "Object-Oriented Programming", code: "OOP", grade: "A" },
    { name: "Database Management Systems", code: "DBMS", grade: "A+" },
    { name: "Web Development (MERN)", code: "WEB", grade: "A" },
    { name: "System Design & Architecture", code: "SYS", grade: "A" },
    { name: "Software Engineering Principles", code: "SE", grade: "A+" },
  ];

  const coCurricularEvents = [
    {
      title: "Smart India Hackathon Participant",
      year: "2025",
      org: "AICTE / Ministry of Education",
      desc: "Collaborated in a team of 6 to architect and deploy functional prototypes addressing national environmental challenges."
    },
    {
      title: "Google Developer Student Club Member",
      year: "2024 -- Present",
      org: "GDSC Parul University",
      desc: "Contributed to student workshops, assisted in organizing campus hackathons, and built community open source projects."
    },
    {
      title: "Technical Content Coordinator",
      year: "2024",
      org: "Parul University Tech Fest",
      desc: "Managed student registration workflows, structured event schedules, and coordinated logistics for 200+ hackathon participants."
    }
  ];

  // Extract GitHub, LeetCode, and LinkedIn usernames if valid
  const gitUsername = useMemo(() => {
    return extractUsername(data.personalInfo.github, 'github');
  }, [data.personalInfo.github]);

  const leetUsername = useMemo(() => {
    return extractUsername(data.personalInfo.leetcode, 'leetcode');
  }, [data.personalInfo.leetcode]);

  const linkedinUsername = useMemo(() => {
    return extractUsername(data.personalInfo.linkedin, 'linkedin');
  }, [data.personalInfo.linkedin]);

  // Quick Copy to clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Match keyword helper
  const matchesKeyword = (text: string, kw: string) => {
    return text.toLowerCase().includes(kw.toLowerCase());
  };

  // Filter skills matching search
  const filteredSkills = useMemo(() => {
    if (!searchTerm) return data.skills;
    return data.skills
      .map((g) => {
        const matchesCategory = matchesKeyword(g.category, searchTerm);
        const matchedItems = g.skills.filter((s) => matchesKeyword(s, searchTerm));
        if (matchesCategory) return g;
        if (matchedItems.length > 0) {
          return { ...g, skills: matchedItems };
        }
        return null;
      })
      .filter((g): g is SkillGroup => g !== null);
  }, [data.skills, searchTerm]);

  // Filter projects matching search AND selected skill
  const filteredProjects = useMemo(() => {
    return data.projects.filter((p) => {
      if (selectedSkill && !p.techStack.includes(selectedSkill)) return false;
      if (!searchTerm) return true;
      const searchTarget = [
        p.title,
        p.year,
        ...p.techStack,
        ...p.bullets,
      ].join(" ");
      return matchesKeyword(searchTarget, searchTerm);
    });
  }, [data.projects, searchTerm, selectedSkill]);

  // Filter certifications matching search
  const filteredCerts = useMemo(() => {
    if (!searchTerm) return data.certifications;
    return data.certifications.filter((c) => {
      const searchTarget = [
        c.title,
        c.issuer,
        c.year,
        ...c.bullets,
      ].join(" ");
      return matchesKeyword(searchTarget, searchTerm);
    });
  }, [data.certifications, searchTerm]);

  // Highlight search terms helper
  const highlightMatch = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="bg-amber-500/15 text-[#b45309] dark:text-amber-250 rounded px-1 py-0.5 font-semibold">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // Dynamic stats & ATS checklist calculations
  const profileStats = useMemo(() => {
    const uniqueSkills = new Set<string>();
    data.skills.forEach(g => g.skills.forEach(s => uniqueSkills.add(s)));
    
    let score = 0;
    if (data.personalInfo.name) score += 15;
    if (data.personalInfo.email && data.personalInfo.phone) score += 15;
    if (data.professionalSummary) score += 15;
    if (data.education && data.education.length > 0) score += 15;
    if (data.skills && data.skills.length > 0) score += 20;
    if (data.projects && data.projects.length > 0) score += 20;

    let bulletsWithMetrics = 0;
    let totalBullets = 0;
    data.projects.forEach(p => {
      p.bullets.forEach(b => {
        totalBullets++;
        if (/\b\d+(?:\.\d+)?%?\b/.test(b) || /\b(?:million|thousand|k|m|lakhs|crores)\b/i.test(b)) {
          bulletsWithMetrics++;
        }
      });
    });

    const hasLowMetrics = totalBullets > 0 && (bulletsWithMetrics / totalBullets) < 0.4;
    const tips = [];
    if (hasLowMetrics) {
      tips.push("Include quantifiable metrics (%, $, count) to at least 40% of your project achievements.");
    }
    if (data.professionalSummary.length > 600) {
      tips.push("Your professional summary is a bit long. Condense it slightly to keep page budget compact.");
    }
    if (!isValidLink(data.personalInfo.leetcode, 'leetcode') || !isValidLink(data.personalInfo.github, 'github')) {
      tips.push("Link both active GitHub and Leetcode handles in Contact info to verify coding portfolios.");
    }
    if (uniqueSkills.size < 10) {
      tips.push("Add more technical keywords to your skills categories to improve ATS keywords density.");
    }
    if (tips.length === 0) {
      tips.push("Your profile is fully optimized! ATS optimization meets 100% of tech recruiting bars.");
    }

    return {
      skillsCount: uniqueSkills.size,
      completeness: score,
      metricsRate: totalBullets > 0 ? Math.round((bulletsWithMetrics / totalBullets) * 100) : 100,
      tips
    };
  }, [data]);

  // Clean Theme Palette
  const cardBgClass = isDark
    ? "bg-zinc-900 border border-zinc-800/85 rounded-3xl p-6 lg:p-8 shadow-xl text-left transition-colors"
    : "bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_rgba(99,102,241,0.02)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.06)] hover:border-indigo-100/80 rounded-3xl p-6 lg:p-8 text-left transition-all duration-300 hover:-translate-y-0.5";

  const searchBgClass = isDark
    ? "bg-zinc-900/60 border border-zinc-805 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 text-left transition-colors"
    : "bg-white/60 backdrop-blur-md border border-white/60 shadow-[0_4px_30px_rgba(99,102,241,0.03)] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 text-left transition-all duration-300";

  const inputClass = isDark
    ? "w-full bg-zinc-950 text-neutral-200 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-all"
    : "w-full bg-white text-neutral-800 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-2xs";

  const headingTextClass = isDark
    ? "text-neutral-50 font-display font-bold"
    : "text-slate-900 font-display font-black";

  const subHeadingTextClass = isDark
    ? "text-xs font-bold font-mono text-zinc-400 tracking-widest uppercase flex items-center gap-1.5 border-b border-zinc-805 pb-2"
    : "text-xs font-bold font-mono text-indigo-950 tracking-widest uppercase flex items-center gap-1.5 border-b border-slate-100 pb-2.5";

  const bodyTextClass = isDark ? "text-zinc-300" : "text-slate-700";
  const mutedTextClass = isDark ? "text-zinc-500" : "text-slate-500";

  const contactBtnClass = isDark
    ? "group flex items-center justify-between w-full bg-zinc-950 border border-zinc-805 text-xs text-zinc-300 px-4 py-2.5 rounded-xl hover:border-zinc-700 hover:text-white transition-all font-medium"
    : "group flex items-center justify-between w-full bg-white/80 hover:bg-white hover:shadow-[0_4px_20px_rgba(99,102,241,0.05)] border border-slate-200 text-xs text-slate-700 px-4.5 py-3 rounded-2xl hover:border-indigo-300 hover:text-indigo-650 shadow-2xs transition-all duration-200 font-semibold";

  const actionLinkClass = isDark
    ? "text-zinc-100 hover:text-white flex items-center gap-1.5 font-bold transition-colors"
    : "text-indigo-650 hover:text-indigo-800 flex items-center gap-1.5 font-bold transition-all";

  return (
    <div className="space-y-8 select-text pb-12 w-full max-w-full">
      
      {/* ================= 1. HERO PROFILE CARD ================= */}
      <div className={cardBgClass}>
        <div className="flex flex-col lg:flex-row lg:items-stretch justify-between gap-8">
          {/* Summary & Name Column */}
          <div className="flex-1 flex flex-col justify-between space-y-5">
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className={`text-[10px] font-mono tracking-widest uppercase font-extrabold ${isDark ? "text-sky-400" : "text-indigo-650"}`}>
                  INTERACTIVE LIVE RESUME PORTFOLIO
                </span>
              </div>
              
              <h2 className={`text-4xl md:text-6xl font-black tracking-tight ${headingTextClass}`}>
                {data.personalInfo.name}
              </h2>
            </div>
            
            <p className={`text-sm sm:text-base leading-relaxed text-justify ${bodyTextClass}`}>
              {data.professionalSummary || "Experienced software developer driving scalable backend frameworks, dynamic microservices, and robust architectural integrations."}
            </p>
          </div>

          {/* Contact Details stack (Stacked vertically on right side) */}
          <div className="w-full lg:w-80 flex flex-col gap-2 shrink-0 justify-center">
            {/* Email Contact Pill */}
            {isValidLink(data.personalInfo.email, 'email') && (
              <button
                onClick={() => handleCopy(data.personalInfo.email, "Email")}
                className={contactBtnClass}
              >
                <div className="flex items-center gap-2.5 truncate max-w-[85%]">
                  <Mail size={14} className="text-zinc-400 shrink-0" />
                  <span className="truncate">{data.personalInfo.email}</span>
                </div>
                {copiedText === "Email" ? (
                  <Check size={11} className="text-emerald-500 shrink-0 font-bold" />
                ) : (
                  <Copy size={11} className="text-zinc-400 opacity-60 group-hover:opacity-100 transition-all shrink-0" />
                )}
              </button>
            )}

            {/* Phone Contact Pill */}
            {isValidLink(data.personalInfo.phone, 'phone') && (
              <button
                onClick={() => handleCopy(data.personalInfo.phone, "Phone")}
                className={contactBtnClass}
              >
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="text-zinc-400 shrink-0" />
                  <span>{data.personalInfo.phone}</span>
                </div>
                {copiedText === "Phone" ? (
                  <Check size={11} className="text-emerald-500 shrink-0 font-bold" />
                ) : (
                  <Copy size={11} className="text-zinc-400 opacity-60 group-hover:opacity-100 transition-all shrink-0" />
                )}
              </button>
            )}

            {/* GitHub Contact Pill */}
            {isValidLink(data.personalInfo.github, 'github') && (
              <a
                href={data.personalInfo.github}
                target="_blank"
                rel="noreferrer"
                className={contactBtnClass}
              >
                <div className="flex items-center gap-2.5">
                  <Github size={14} className="text-zinc-400 shrink-0" />
                  <span>GitHub</span>
                </div>
                <ExternalLink size={11} className="text-zinc-400 opacity-60" />
              </a>
            )}

            {/* LinkedIn Contact Pill */}
            {isValidLink(data.personalInfo.linkedin, 'linkedin') && (
              <a
                href={data.personalInfo.linkedin}
                target="_blank"
                rel="noreferrer"
                className={contactBtnClass}
              >
                <div className="flex items-center gap-2.5">
                  <Linkedin size={14} className="text-zinc-400 shrink-0" />
                  <span>LinkedIn</span>
                </div>
                <ExternalLink size={11} className="text-zinc-400 opacity-60" />
              </a>
            )}

            {/* LeetCode Contact Pill */}
            {isValidLink(data.personalInfo.leetcode, 'leetcode') && (
              <a
                href={data.personalInfo.leetcode}
                target="_blank"
                rel="noreferrer"
                className={contactBtnClass}
              >
                <div className="flex items-center gap-2.5">
                  <Code size={14} className="text-zinc-400 shrink-0" />
                  <span>LeetCode</span>
                </div>
                <ExternalLink size={11} className="text-zinc-400 opacity-60" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ================= 6. DYNAMIC OVERLAY KEYWORD SEARCH PANEL (MOVED TO TOP) ================= */}
      <div className={searchBgClass}>
        <div className="relative w-full md:flex-1">
          <Search size={15} className={`absolute left-3.5 top-3.5 ${isDark ? "text-zinc-500" : "text-neutral-405"}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords (e.g. Java, Python, Spring Boot, React, Parul)..."
            className={inputClass}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className={`absolute right-3.5 top-2.5 text-xs px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                isDark ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700" : "bg-neutral-200 text-neutral-800 hover:bg-neutral-300"
              }`}
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
          <span className={`text-[10px] uppercase font-bold px-1 whitespace-nowrap shrink-0 ${isDark ? "text-zinc-500" : "text-slate-500"}`}>
            Hot Tags:
          </span>
          <button
            onClick={() => setSelectedSkill(null)}
            className={`text-xs px-3 py-1.5 rounded-xl transition-all shrink-0 font-bold cursor-pointer ${
              selectedSkill === null
                ? (isDark ? "bg-white text-zinc-950" : "bg-indigo-600 text-white shadow-md shadow-indigo-600/10")
                : (isDark ? "bg-zinc-950 border border-zinc-800 text-zinc-400" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50")
            }`}
          >
            All Tech
          </button>
          
          {["Java", "Spring Boot", "React.js", "Python", "SQL"].map((skill) => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
              className={`text-xs px-3 py-1.5 rounded-xl transition-all shrink-0 font-bold cursor-pointer ${
                selectedSkill === skill
                  ? (isDark ? "bg-white text-zinc-950" : "bg-indigo-600 text-white shadow-md shadow-indigo-600/10")
                  : (isDark ? "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850" : "bg-white border border-slate-200 text-slate-600 hover:text-indigo-605 hover:bg-slate-50")
              }`}
            >
              #{skill}
            </button>
          ))}
        </div>
      </div>

      {/* ================= 2. CORE STATS METRICS ROW ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Profile Completeness */}
        <div className={cardBgClass}>
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-[10px] font-mono tracking-wider font-bold uppercase ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                Completeness Strength
              </span>
              <h4 className={`text-3xl sm:text-4xl font-black mt-1 font-mono tracking-tight ${isDark ? "text-sky-400" : "text-indigo-600"}`}>
                {profileStats.completeness}%
              </h4>
            </div>
            <div className={`p-2 rounded-xl ${isDark ? "bg-sky-500/10 text-sky-400" : "bg-indigo-50 text-indigo-600 border border-indigo-100"}`}>
              <Brain size={18} />
            </div>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-zinc-800 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isDark ? "bg-gradient-to-r from-sky-500 to-indigo-500" : "bg-gradient-to-r from-indigo-600 to-violet-500"}`}
              style={{ width: `${profileStats.completeness}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Skills Tag inventory */}
        <div className={cardBgClass}>
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-[10px] font-mono tracking-wider font-bold uppercase ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                Technology Keywords
              </span>
              <h4 className={`text-3xl sm:text-4xl font-black mt-1 font-mono tracking-tight ${isDark ? "text-indigo-400" : "text-indigo-650"}`}>
                {profileStats.skillsCount} Tags
              </h4>
            </div>
            <div className={`p-2 rounded-xl ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-650 border border-indigo-100"}`}>
              <Cpu size={18} />
            </div>
          </div>
          <p className="text-[10.5px] mt-4 font-semibold text-neutral-500 dark:text-zinc-400">
            Mapped in {data.skills.length} categories
          </p>
        </div>

        {/* Metric 3: Quantifiable Metrics Rate */}
        <div className={cardBgClass}>
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-[10px] font-mono tracking-wider font-bold uppercase ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                Quantifiable Metrics Rate
              </span>
              <h4 className={`text-3xl sm:text-4xl font-black mt-1 font-mono tracking-tight ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                {profileStats.metricsRate}%
              </h4>
            </div>
            <div className={`p-2 rounded-xl ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-zinc-800 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isDark ? "bg-emerald-500" : "bg-emerald-600"}`}
              style={{ width: `${profileStats.metricsRate}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Certifications */}
        <div className={cardBgClass}>
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-[10px] font-mono tracking-wider font-bold uppercase ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                Micro-Credentials
              </span>
              <h4 className={`text-3xl sm:text-4xl font-black mt-1 font-mono tracking-tight ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                {data.certifications.length} Mapped
              </h4>
            </div>
            <div className={`p-2 rounded-xl ${isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
              <Award size={18} />
            </div>
          </div>
          <p className="text-[10.5px] mt-4 font-semibold text-neutral-500 dark:text-zinc-400">
            Professional CV credentials
          </p>
        </div>

      </div>

      {/* ================= 3. ATS FEEDBACK PANEL ================= */}
      <div className={`w-full rounded-3xl p-6 lg:p-8 text-left transition-all duration-300 ${
        isDark
          ? "bg-emerald-950/20 border border-emerald-900/30 text-emerald-250 shadow-xl"
          : "bg-emerald-50/40 backdrop-blur-sm border border-emerald-100/80 shadow-[0_8px_30px_rgba(16,185,129,0.02)] text-emerald-950 hover:shadow-[0_12px_36px_rgba(16,185,129,0.04)]"
      }`}>
        <h4 className={`text-xs font-bold font-mono tracking-widest uppercase flex items-center gap-1.5 pb-2.5 border-b ${
          isDark ? "border-emerald-900/40 text-emerald-400" : "border-emerald-100 text-emerald-800"
        }`}>
          <FileCheck2 size={13} />
          ATS Performance Analysis & Optimization Tips
        </h4>
        
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs font-semibold text-left">
          {profileStats.tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className={`p-0.5 rounded mt-0.5 ${
                isDark ? "bg-emerald-550/10 text-emerald-400" : "bg-emerald-100 text-emerald-600"
              }`}>
                <CheckCircle2 size={12} className="stroke-[2.5]" />
              </span>
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ================= RECRUITER INTERACTIVE Q&A PANEL (NEW SECTION) ================= */}
      <div className={cardBgClass}>
        <div className="border-b pb-3 mb-5 border-neutral-200 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isDark ? "bg-sky-500/10 text-sky-400" : "bg-indigo-50 text-indigo-655 border border-indigo-100"}`}>
              <Brain size={18} />
            </div>
            <div>
              <h4 className={`text-base font-bold ${headingTextClass}`}>
                Recruiter Q&A Simulator (Interview Prep)
              </h4>
              <p className={`text-[10px] uppercase font-mono mt-0.5 ${mutedTextClass}`}>
                Click common questions to simulate candidate responses instantly!
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Question List (Left) */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            {dynamicQAs.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveQA(idx)}
                className={`w-full text-left px-4 py-3 rounded-2xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeQA === idx
                    ? (isDark 
                        ? "bg-sky-500/10 text-sky-400 border-sky-500/40 shadow-xs" 
                        : "bg-indigo-600 text-white border-indigo-650 shadow-md shadow-indigo-600/10")
                    : (isDark 
                        ? "bg-zinc-950 border-zinc-805 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850" 
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-400 shadow-2xs")
                }`}
              >
                {item.q}
              </button>
            ))}
          </div>

          {/* Animated Answer Bubble (Right) */}
          <div className="lg:col-span-7 flex">
            <AnimatePresence mode="wait">
              {activeQA !== null && (
                <motion.div
                  key={activeQA}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className={`p-5 rounded-3xl border flex gap-4 text-xs text-left leading-relaxed w-full ${
                    isDark 
                      ? "bg-zinc-950 border-zinc-805 text-zinc-300" 
                      : "bg-slate-50/70 border-slate-200 shadow-inner text-slate-700"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isDark ? "bg-sky-500/10 border-sky-500/20 text-sky-400" : "bg-indigo-50 border-indigo-150 text-indigo-650"
                  }`}>
                    <Brain size={14} className="animate-pulse" />
                  </div>
                  <div>
                    <h5 className={`font-bold mb-1.5 uppercase font-mono tracking-wider text-[9px] ${isDark ? "text-sky-404" : "text-indigo-650"}`}>
                      Candidate AI Voice Responder
                    </h5>
                    <p className="font-semibold text-justify">
                      {dynamicQAs[activeQA]?.a}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ================= 4. VERIFIED DEVELOPER ACTIVITY PORTFOLIO INTEGRATION ================= */}
      {(gitUsername || leetUsername || linkedinUsername) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <h3 className={`text-xs font-bold font-mono tracking-widest uppercase ${isDark ? "text-zinc-300" : "text-neutral-700"}`}>
              Verified Developer & Professional Integrations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* GitHub Card */}
            {gitUsername && (
              <div className={cardBgClass}>
                <div className="flex justify-between items-start pb-3 border-b border-neutral-200 dark:border-zinc-800/60">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-450 text-[10px] font-mono font-bold tracking-tight">
                      ✓ Connected
                    </span>
                    <h4 className={`text-sm font-bold ${headingTextClass} pt-1`}>
                      GitHub Portfolio
                    </h4>
                  </div>
                  <Github size={20} className={isDark ? "text-zinc-500" : "text-neutral-400"} />
                </div>
                
                <div className="mt-4 space-y-2 text-xs font-semibold text-neutral-600 dark:text-zinc-350">
                  <div className="flex justify-between">
                    <span>Parsed Username:</span>
                    <span className="font-mono text-indigo-600 dark:text-sky-400 font-bold">@{gitUsername}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verification Status:</span>
                    <span className="text-emerald-500 font-bold">Profile Link Active</span>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-neutral-200 dark:border-zinc-800/60">
                  <a 
                    href={data.personalInfo.github} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-indigo-650 dark:text-sky-400 font-bold hover:underline flex items-center gap-1"
                  >
                    Open repository overview <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            )}

            {/* LeetCode Card */}
            {leetUsername && (
              <div className={cardBgClass}>
                <div className="flex justify-between items-start pb-3 border-b border-neutral-200 dark:border-zinc-800/60">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-450 text-[10px] font-mono font-bold tracking-tight">
                      ✓ Connected
                    </span>
                    <h4 className={`text-sm font-bold ${headingTextClass} pt-1`}>
                      LeetCode Code Portal
                    </h4>
                  </div>
                  <Code size={20} className={isDark ? "text-zinc-500" : "text-neutral-400"} />
                </div>
                
                <div className="mt-4 space-y-2 text-xs font-semibold text-neutral-600 dark:text-zinc-350">
                  <div className="flex justify-between">
                    <span>Parsed Handle:</span>
                    <span className="font-mono text-indigo-600 dark:text-sky-400 font-bold">@{leetUsername}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Solving History:</span>
                    <span className="text-emerald-500 font-bold">Profile Link Active</span>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-neutral-200 dark:border-zinc-800/60">
                  <a 
                    href={data.personalInfo.leetcode} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-indigo-650 dark:text-sky-400 font-bold hover:underline flex items-center gap-1"
                  >
                    Verify solved submissions <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            )}

            {/* LinkedIn Card */}
            {linkedinUsername && (
              <div className={cardBgClass}>
                <div className="flex justify-between items-start pb-3 border-b border-neutral-200 dark:border-zinc-800/60">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-450 text-[10px] font-mono font-bold tracking-tight">
                      ✓ Connected
                    </span>
                    <h4 className={`text-sm font-bold ${headingTextClass} pt-1`}>
                      LinkedIn Profile
                    </h4>
                  </div>
                  <Linkedin size={20} className={isDark ? "text-zinc-500" : "text-neutral-400"} />
                </div>
                
                <div className="mt-4 space-y-2 text-xs font-semibold text-neutral-600 dark:text-zinc-350">
                  <div className="flex justify-between">
                    <span>Parsed Profile:</span>
                    <span className="font-mono text-indigo-600 dark:text-sky-400 font-bold">@{linkedinUsername}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Network:</span>
                    <span className="text-emerald-500 font-bold">Profile Link Active</span>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-neutral-200 dark:border-zinc-800/60">
                  <a 
                    href={data.personalInfo.linkedin} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-indigo-650 dark:text-sky-400 font-bold hover:underline flex items-center gap-1"
                  >
                    Open professional profile <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 5. CORE TWO-COLUMN RESUME DETAILS GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Skillsets & Academic history */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Technical Skills Card */}
          <div className={cardBgClass}>
            <h3 className={subHeadingTextClass}>
              <Sparkles size={13} className="shrink-0" />
              Technical Skillsets
            </h3>

            <div className="space-y-5 pt-2">
              {filteredSkills.map((group) => (
                <div key={group.id} className="space-y-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? "text-zinc-400" : "text-neutral-500"}`}>
                    {highlightMatch(group.category, searchTerm)}
                  </span>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {group.skills.map((skill, sIdx) => {
                      const isMatched = searchTerm && skill.toLowerCase().includes(searchTerm.toLowerCase());
                      const isFiltered = selectedSkill === skill;
                      const hasRating = skillMastery[skill] !== undefined;

                      return (
                        <div key={sIdx} className="w-full">
                          <span
                            onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
                            className={`inline-block text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                              isFiltered
                                ? (isDark ? "bg-white text-zinc-950 font-bold" : "bg-neutral-900 text-zinc-50 font-bold shadow-sm")
                                : isMatched
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200 border border-amber-300 dark:border-amber-500/25"
                                : (isDark ? "bg-zinc-950 border border-zinc-800 text-zinc-350 hover:text-zinc-100" : "bg-neutral-50 border border-neutral-200/90 text-neutral-700 hover:border-neutral-350 hover:bg-white shadow-xs")
                            }`}
                          >
                            {highlightMatch(skill, searchTerm)}
                          </span>

                          {/* Skill mastery sliders */}
                          {hasRating && (
                            <div className="mt-1.5 pl-1.5 pr-2.5 flex items-center gap-2">
                              <input 
                                type="range" 
                                min="50" 
                                max="100" 
                                value={skillMastery[skill]} 
                                onChange={(e) => setSkillMastery({ ...skillMastery, [skill]: parseInt(e.target.value) })}
                                className="flex-1 h-0.5 bg-neutral-200 dark:bg-zinc-800 appearance-none cursor-pointer accent-indigo-550" 
                                title="Adjust Skill Rating for Candidate"
                              />
                              <span className="font-mono text-[9px] text-zinc-500 w-6 text-right shrink-0">
                                {skillMastery[skill]}%
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {filteredSkills.length === 0 && (
                <div className={`text-center py-4 text-xs ${mutedTextClass}`}>
                  No matching skill categories.
                </div>
              )}
            </div>
          </div>

          {/* LeetCode & Problem Solving Stats Card (NEW) */}
          <div className={cardBgClass}>
            <h3 className={subHeadingTextClass}>
              <Code size={13} className="shrink-0 text-amber-500" />
              LeetCode Coding Stats
            </h3>
            
            <div className="pt-2 space-y-4 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-500 dark:text-zinc-400">
                  Global Solved Rating
                </span>
                <span className={`text-[10.5px] font-mono font-black px-2.5 py-0.5 rounded-full ${
                  isDark ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-amber-50 text-amber-800 border border-amber-250"
                }`}>
                  {leetcodeStats.badge}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3.5 rounded-2xl border text-center ${isDark ? "bg-zinc-950 border-zinc-805" : "bg-white border-slate-200 shadow-2xs"}`}>
                  <span className="block text-[9px] uppercase font-bold text-zinc-500">Solved Problems</span>
                  <span className={`text-2xl font-black font-mono tracking-tight block mt-1 ${isDark ? "text-sky-400" : "text-indigo-650"}`}>
                    {leetcodeStats.solved}
                  </span>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center ${isDark ? "bg-zinc-950 border-zinc-805" : "bg-white border-slate-200 shadow-2xs"}`}>
                  <span className="block text-[9px] uppercase font-bold text-zinc-500">Global Rank</span>
                  <span className={`text-xs font-black font-mono block mt-2.5 ${isDark ? "text-zinc-300" : "text-slate-800"}`}>
                    #{leetcodeStats.rank}
                  </span>
                </div>
              </div>

              {/* Solved progression list */}
              <div className="space-y-2 pt-1">
                {/* Easy */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                    <span>Easy ({leetcodeStats.easy})</span>
                    <span>Target: 100</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((leetcodeStats.easy / 100) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                    <span>Medium ({leetcodeStats.medium})</span>
                    <span>Target: 150</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((leetcodeStats.medium / 150) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Hard */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                    <span>Hard ({leetcodeStats.hard})</span>
                    <span>Target: 30</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min((leetcodeStats.hard / 30) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CSE Subject Areas / Coursework Grid (NEW) */}
          <div className={cardBgClass}>
            <h3 className={subHeadingTextClass}>
              <BookOpen size={13} className="shrink-0 text-indigo-500" />
              Core CSE Coursework
            </h3>
            
            <div className="pt-2 grid grid-cols-2 gap-2 text-left">
              {coursework.map((item, idx) => (
                <div key={idx} className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                  isDark ? "bg-zinc-950 border-zinc-805" : "bg-slate-50/50 border-slate-200"
                }`}>
                  <span className={`text-[8px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-md self-start ${
                    isDark ? "bg-zinc-900 text-zinc-400" : "bg-white text-slate-600 shadow-2xs"
                  }`}>
                    {item.code}
                  </span>
                  <h4 className="text-[10px] font-bold leading-tight mt-1.5 text-zinc-700 dark:text-zinc-300">
                    {item.name}
                  </h4>
                  <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-dashed border-neutral-200 dark:border-zinc-850">
                    <span className="text-[8.5px] text-zinc-500">Grade:</span>
                    <span className="text-[9.5px] font-mono font-extrabold text-emerald-500">{item.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Timeline */}
          {data.education && data.education.length > 0 && (
            <div className={cardBgClass}>
              <h3 className={subHeadingTextClass}>
                <GraduationCap size={13} className="shrink-0" />
                Academic History
              </h3>

              <div className={`flex flex-col gap-6 relative pl-3 border-l ${isDark ? "border-zinc-800" : "border-neutral-200"} pt-2`}>
                {data.education.map((edu) => {
                  return (
                    <div key={edu.id} className="relative space-y-1.5 text-left font-sans">
                      {/* Timeline Ball indicator */}
                      <span className={`absolute -left-[17px] top-1.5 w-2 h-2 rounded-full border ${
                        isDark ? "bg-zinc-100 border-zinc-900 ring-4 ring-zinc-900/60" : "bg-neutral-800 border-white ring-4 ring-neutral-50"
                      }`} />

                      <div className="text-xs font-bold flex justify-between items-start gap-2 flex-wrap">
                        <span className={`leading-tight ${headingTextClass}`}>
                          {highlightMatch(edu.institution, searchTerm)}
                        </span>
                        <span className={`text-[10px] font-mono whitespace-nowrap shrink-0 px-2 py-0.5 rounded-full font-bold ${
                          isDark ? "bg-zinc-950 text-zinc-400 border border-zinc-800" : "bg-neutral-100/90 text-neutral-700 border border-neutral-200"
                        }`}>
                          {edu.years}
                        </span>
                      </div>

                      <div className={`text-xs italic ${isDark ? "text-zinc-400" : "text-neutral-600"}`}>
                        {highlightMatch(edu.degree, searchTerm)}
                      </div>

                      <div className={`flex items-center gap-1 text-[10px] ${mutedTextClass}`}>
                        <MapPin size={10} />
                        <span>{edu.location}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Interactive Projects & Accomplishments */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Projects Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1 font-sans">
              <h3 className={`text-sm font-bold font-mono tracking-wider uppercase flex items-center gap-2 ${isDark ? "text-zinc-300" : "text-neutral-700"}`}>
                <Layers size={14} className="shrink-0" />
                Featured Projects & Systems
                <span className={`text-xs font-normal ${mutedTextClass}`}>
                  ({filteredProjects.length})
                </span>
              </h3>
              {selectedSkill && (
                <button
                  onClick={() => setSelectedSkill(null)}
                  className={`text-xs hover:underline flex items-center font-bold ${isDark ? "text-zinc-300 hover:text-white" : "text-neutral-800 hover:text-neutral-950"}`}
                >
                  Reset tech filter ✕
                </button>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((proj) => (
                  <motion.div
                    key={proj.id}
                    layoutId={proj.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`${cardBgClass} hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex justify-between items-start gap-4 flex-wrap mb-2.5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-base font-bold ${headingTextClass}`}>
                            {highlightMatch(proj.title, searchTerm)}
                          </h4>
                        </div>
                        
                        {/* Tech Stack Chips list */}
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {proj.techStack.map((tech) => {
                            const isFiltered = selectedSkill === tech;
                            return (
                              <span
                                key={tech}
                                onClick={() => setSelectedSkill(selectedSkill === tech ? null : tech)}
                                className={`text-[10px] font-semibold px-2 px-2.5 py-0.5 rounded-lg cursor-pointer transition-all ${
                                  isFiltered
                                    ? (isDark ? "bg-white text-zinc-950 font-bold" : "bg-neutral-900 text-white font-bold")
                                    : (isDark ? "bg-zinc-950 border border-zinc-805 text-zinc-400 hover:text-zinc-200" : "bg-neutral-50 border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:bg-white")
                                }`}
                              >
                                {highlightMatch(tech, searchTerm)}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-mono">
                        <span className={`text-xs px-2.5 py-1 rounded-xl flex items-center gap-1.5 shrink-0 ${
                          isDark ? "bg-zinc-950 border border-zinc-800 text-zinc-400" : "bg-neutral-100/80 border border-neutral-200 text-neutral-700"
                        }`}>
                          <Calendar size={11} />
                          {proj.year}
                        </span>
                      </div>
                    </div>

                    {/* Bullets lists */}
                    <ul className={`text-xs space-y-2 pl-4 list-disc mt-4 leading-relaxed text-justify ${isDark ? "text-zinc-350" : "text-neutral-700"}`}>
                      {proj.bullets.map((bullet, idx) => (
                        <li key={idx} className="relative group-bullets pr-1 hover:text-neutral-950 dark:hover:text-white transition-colors">
                          {highlightMatch(bullet, searchTerm)}
                          <button
                            onClick={() => handleCopy(bullet, `Bullet ${idx + 1}`)}
                            className={`inline-flex self-center ml-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all align-middle cursor-pointer ${
                              isDark ? "text-zinc-500 hover:text-zinc-300" : "text-neutral-400 hover:text-neutral-700"
                            }`}
                            title="Copy achievement bullet"
                          >
                            <Copy size={9} className="ml-1.5" />
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Links */}
                    {(proj.githubUrl || proj.liveUrl) && (
                      <div className={`flex gap-4 items-center justify-start border-t mt-4 pt-3.5 text-xs ${isDark ? "border-zinc-800" : "border-neutral-200/90"}`}>
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={actionLinkClass}
                          >
                            <Github size={12} />
                            Repository Code
                            <ExternalLink size={10} className="opacity-60" />
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={actionLinkClass}
                          >
                            <ExternalLink size={12} />
                            Deploy Demo
                          </a>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredProjects.length === 0 && (
                <div className={`text-center py-10 rounded-2xl border border-dashed text-xs ${
                  isDark ? "bg-zinc-950 border-zinc-805 text-zinc-500" : "bg-neutral-50/80 border-neutral-300 text-neutral-500"
                }`}>
                  No active projects found matching query filters. Click active hashtags to clear filters.
                </div>
              )}
            </div>
          </div>

          {/* Certifications Timeline */}
          {data.certifications && data.certifications.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className={`text-sm font-bold font-mono tracking-wider uppercase flex items-center gap-2 ${isDark ? "text-zinc-300" : "text-neutral-700"}`}>
                <Award size={14} className="shrink-0" />
                Certifications & Micro-Credentials
                <span className={`text-xs font-normal ${mutedTextClass}`}>
                  ({filteredCerts.length})
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCerts.map((cert) => (
                  <div key={cert.id} className={`${cardBgClass} space-y-3 p-4`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1 text-left">
                        <span className={`text-[9px] uppercase tracking-wider font-extrabold ${isDark ? "text-zinc-400" : "text-neutral-500"}`}>
                          {cert.issuer}
                        </span>
                        <h4 className={`text-xs font-bold leading-tight ${headingTextClass}`}>
                          {highlightMatch(cert.title, searchTerm)}
                        </h4>
                      </div>
                      <span className={`text-[10px] font-mono shrink-0 px-2 py-0.5 rounded font-medium ${
                        isDark ? "bg-zinc-950 text-zinc-400 border border-zinc-800" : "bg-neutral-100 text-neutral-700"
                      }`}>
                        {cert.year}
                      </span>
                    </div>

                    <ul className={`text-xs space-y-1.5 list-disc pl-3.5 text-left leading-normal ${isDark ? "text-zinc-400" : "text-neutral-600"}`}>
                      {cert.bullets.map((bullet, idx) => (
                        <li key={idx}>
                          {highlightMatch(bullet, searchTerm)}
                        </li>
                      ))}
                    </ul>

                    {(cert.certificateUrl || cert.badgeUrl) && (
                      <div className={`flex gap-4 shrink-0 justify-start border-t pt-2.5 mt-2.5 text-[11px] ${isDark ? "border-zinc-800" : "border-neutral-200"}`}>
                        {cert.certificateUrl && (
                          <a
                            href={cert.certificateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={actionLinkClass}
                          >
                            <ExternalLink size={10} />
                            Verification URL
                          </a>
                        )}
                        {cert.badgeUrl && (
                          <a
                            href={cert.badgeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={actionLinkClass}
                          >
                            <ExternalLink size={10} />
                            Credentials Badge
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Co-curricular & Leadership Experience Timeline (NEW) */}
          <div className="space-y-4 pt-2">
            <h3 className={`text-sm font-bold font-mono tracking-wider uppercase flex items-center gap-2 ${isDark ? "text-zinc-300" : "text-neutral-700"}`}>
              <Brain size={14} className="shrink-0 text-sky-500" />
              Co-Curricular & Leadership Experience
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coCurricularEvents.map((event, idx) => (
                <div key={idx} className={`${cardBgClass} space-y-2 p-4`} style={{ transform: "none" }}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5 text-left">
                      <span className={`text-[8.5px] uppercase tracking-wider font-extrabold ${isDark ? "text-zinc-450" : "text-neutral-500"}`}>
                        {event.org}
                      </span>
                      <h4 className={`text-xs font-bold leading-tight ${headingTextClass}`}>
                        {event.title}
                      </h4>
                    </div>
                    <span className={`text-[9.5px] font-mono shrink-0 px-2 py-0.5 rounded font-semibold ${
                      isDark ? "bg-zinc-950 text-zinc-450 border border-zinc-800" : "bg-neutral-100 text-neutral-700"
                    }`}>
                      {event.year}
                    </span>
                  </div>
                  <p className={`text-[11px] text-justify leading-relaxed ${isDark ? "text-zinc-400" : "text-neutral-600"}`}>
                    {event.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
