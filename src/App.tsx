/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { ResumeData } from "./types";
import { initialResumeData, blankResumeData } from "./initialData";
import { LatexPrintView } from "./components/LatexPrintView";
import { ResumeDataEditor } from "./components/ResumeDataEditor";
import { DigitalDashboard } from "./components/DigitalDashboard";
import {
  FileCode,
  Layout,
  Columns,
  FileText,
  Sliders,
  Printer,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Github,
  Award,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Eye,
  MessageSquare,
  Send,
  X,
  Bot,
  User,
  Compass,
  ArrowRight,
  Lock,
  LogOut,
  UserCheck,
  Zap,
  CheckCircle,
  HelpCircle,
  Code2
} from "lucide-react";

const ACCOUNTS_STORAGE_KEY = "khushi-spark-user-accounts";
const SESSION_STORAGE_KEY = "khushi-spark-active-session";

interface UserAccount {
  username: string;
  email: string;
  password?: string;
  resumeData?: ResumeData;
}

export default function App() {
  // -------------------------------------------------------------
  // A. AUTHENTICATION & LANDING STATE
  // -------------------------------------------------------------
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    let list: UserAccount[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved) as UserAccount[];
      } catch (e) {
        console.error("Failed to parse accounts:", e);
      }
    }
    // Ensure Khushi's account is always present with password Khushi@123 and her resumeData
    const khushiIdx = list.findIndex(a => a.username.toLowerCase() === "khushi");
    const khushiAcc: UserAccount = {
      username: "khushi",
      email: "chorvadikhushi@gmail.com",
      password: "Khushi@123",
      resumeData: initialResumeData
    };

    if (khushiIdx > -1) {
      list[khushiIdx] = {
        ...list[khushiIdx],
        password: "Khushi@123",
        resumeData: list[khushiIdx].resumeData || initialResumeData
      };
    } else {
      list.push(khushiAcc);
    }
    // Keep local storage synchronized
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(list));
    return list;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as UserAccount;
      } catch (e) {
        console.error("Failed to parse current user:", e);
      }
    }
    return null;
  });

  const [showAuthModal, setShowAuthModal] = useState(false);

  // Landing Page Interactive Demo States
  const [landingDemoTab, setLandingDemoTab] = useState<"chat" | "spacing" | "lens">("chat");
  const [demoFontSize, setDemoFontSize] = useState<number>(10);
  const [demoSectionSpacing, setDemoSectionSpacing] = useState<number>(12);
  const [demoChatHistory, setDemoChatHistory] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    {
      role: "assistant",
      text: "👋 Hi! I'm Spark AI. I can review your resume bullet points and apply high-impact professional metrics. Click 'Boost summary points' below to see me in action!"
    }
  ]);
  const [demoIsTyping, setDemoIsTyping] = useState<boolean>(false);
  const [demoLensCoords, setDemoLensCoords] = useState<{ x: number; y: number; px: number; py: number }>({ x: 0, y: 0, px: 0, py: 0 });
  const [demoLensActive, setDemoLensActive] = useState<boolean>(false);

  const handleDemoChatAction = () => {
    if (demoIsTyping) return;
    setDemoIsTyping(true);
    setDemoChatHistory(prev => [
      ...prev,
      { role: "user", text: "Please boost my professional summary points!" }
    ]);
    
    setTimeout(() => {
      setDemoChatHistory(prev => [
        ...prev,
        { 
          role: "assistant", 
          text: "✨ Revised summary recommendations applied:\n\"Innovative Software Engineer with 2+ years of experience delivering robust frontend services. Optimized page load speeds by 40% using dynamic imports and deployed secure REST APIs handling 5,000+ daily sessions.\"" 
        }
      ]);
      setDemoIsTyping(false);
    }, 1000);
  };

  // Auth local inputs
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // -------------------------------------------------------------
  // B. WORKSPACE DATA & STYLING STATES
  // -------------------------------------------------------------
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);

  // Load custom user data when user changes
  useEffect(() => {
    if (currentUser) {
      // Look up current user in real account database state
      const acc = accounts.find((a) => a.username.toLowerCase() === currentUser.username.toLowerCase());
      if (acc && acc.resumeData) {
        const isKhushi = currentUser.username.toLowerCase() === "khushi";
        const hasKhushiName = acc.resumeData.personalInfo.name === "KHUSHI K CHORVADI";
        
        if (!isKhushi && hasKhushiName) {
          // Force-reset to blank template for non-khushi username
          setResumeData(blankResumeData);
          
          // Update the list inside localStorage and state
          setAccounts(prevAccounts => {
            const updated = prevAccounts.map(item => {
              if (item.username.toLowerCase() === currentUser.username.toLowerCase()) {
                return { ...item, resumeData: blankResumeData };
              }
              return item;
            });
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
            return updated;
          });
        } else {
          setResumeData(acc.resumeData);
        }
      } else {
        const isKhushi = currentUser.username.toLowerCase() === "khushi";
        setResumeData(isKhushi ? initialResumeData : blankResumeData);
      }
    } else {
      // Default guest mode: load initialResumeData and restrict to split builder
      setResumeData(initialResumeData);
      setWorkspaceMode("split");
    }
  }, [currentUser]);

  // Save current resume state to active user's account and localStorage
  const saveUserResume = (updatedData: ResumeData) => {
    setResumeData(updatedData);
    if (currentUser) {
      const updatedAccounts = accounts.map((acc) => {
        if (acc.username.toLowerCase() === currentUser.username.toLowerCase()) {
          return { ...acc, resumeData: updatedData };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));
    }
  };

  // -------------------------------------------------------------
  // C. CHATBOT COMPANION STATES
  // -------------------------------------------------------------
  const [chatOpen, setChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{
    role: "user" | "assistant";
    text: string;
    suggestedData?: Partial<ResumeData> | null;
    applied?: boolean;
  }>>([
    {
      role: "assistant",
      text: "👋 Hi! I'm **Resume AI Spark**, your interactive workspace assistant. I can help you proofread, rewrite summary bullets with key metrics, recommend missing skills, or reorganize layout templates. Try asking me a question or click a quick-prompt below!"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping, chatOpen]);

  // Quick Action Chat prompts
  const quickPrompts = [
    { label: "✨ Refine Professional Summary", prompt: "Please rewrite my professional summary to highlight leadership, metrics, and high impact technology qualifications." },
    { label: "📈 Boost Project Impact", prompt: "Analyze my project bullet points and revise them to feature action verbs and quantifiable results." },
    { label: "🛠️ Recommend Gaps & Skills", prompt: "Examine my tech stack and suggest 5 advanced dev skills that are popular in Silicon Valley." }
  ];

  // -------------------------------------------------------------
  // D. WORKSPACE GRAPHICS & PREVIEW CONTROLS
  // -------------------------------------------------------------
  const [workspaceMode, setWorkspaceMode] = useState<"dashboard" | "split" | "sheet">("split");

  const [workspaceTheme, setWorkspaceTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("khushi-resume-theme");
    return (saved as "dark" | "light") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("khushi-resume-theme", workspaceTheme);
  }, [workspaceTheme]);

  // Layout Spacing Tuners (Formerly specifications config)
  const [fontSize, setFontSize] = useState<number>(9.5); // in pt
  const [lineHeight, setLineHeight] = useState<number>(1.2); // multiplier
  const [margins, setMargins] = useState<number>(0.55); // in inches
  const [sectionSpacing, setSectionSpacing] = useState<number>(8); // in px

  const [fontTheme, setFontTheme] = useState<"classic-serif" | "modern-sans" | "editorial-lora">("classic-serif");
  const [showIcons, setShowIcons] = useState<boolean>(false);

  const [documentHeight, setDocumentHeight] = useState<number>(1056);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [zoomMode, setZoomMode] = useState<"fit-width" | "fit-page" | "manual">("fit-width");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [autoScaleHeight, setAutoScaleHeight] = useState<number>(0.65);
  const [autoScaleWidth, setAutoScaleWidth] = useState<number>(0.85);

  const [magnifierEnabled, setMagnifierEnabled] = useState<boolean>(true);
  const [lensActive, setLensActive] = useState<boolean>(false);
  const [lensCoords, setLensCoords] = useState<{ x: number; y: number; px: number; py: number }>({ x: 0, y: 0, px: 0, py: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = rect.width ? Math.min(Math.max(x / rect.width, 0), 1) : 0;
    const py = rect.height ? Math.min(Math.max(y / rect.height, 0), 1) : 0;
    setLensCoords({ x, y, px, py });
  };

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        // Height scale calculation
        const containerHeight = previewContainerRef.current.clientHeight;
        const availableHeight = containerHeight - 85;
        if (availableHeight > 200) {
          const calculatedHeight = Math.min(Math.max(availableHeight / 1056, 0.35), 1.2);
          setAutoScaleHeight(calculatedHeight);
        }

        // Width scale calculation
        const containerWidth = previewContainerRef.current.clientWidth;
        const availableWidth = containerWidth - 48;
        if (availableWidth > 200) {
          const calculatedWidth = Math.min(Math.max(availableWidth / 816, 0.35), 1.5);
          setAutoScaleWidth(calculatedWidth);
        }
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    // Extra timeout trigger to settle scales on mode transitions
    const timer = setTimeout(updateScale, 100);
    return () => {
      window.removeEventListener("resize", updateScale);
      clearTimeout(timer);
    };
  }, [workspaceMode, documentHeight, sidebarOpen, zoomMode]);

  const effectiveZoom =
    zoomMode === "fit-page"
      ? autoScaleHeight
      : zoomMode === "fit-width"
      ? autoScaleWidth
      : zoomScale;

  useEffect(() => {
    const checkHeight = () => {
      const el = document.getElementById("latex-print-view");
      if (el) {
        const h = el.scrollHeight;
        setDocumentHeight(h);
        setIsOverflowing(h > 1054);
      }
    };
    const timer = setTimeout(checkHeight, 150);
    return () => clearTimeout(timer);
  }, [resumeData, fontSize, lineHeight, margins, sectionSpacing, fontTheme, showIcons]);

  const applyPreset = (preset: "academic-classic" | "executive-sleek" | "editorial-crisp" | "compact-efficient") => {
    if (preset === "academic-classic") {
      setFontTheme("classic-serif");
      setFontSize(10.5);
      setLineHeight(1.35);
      setMargins(0.7);
      setSectionSpacing(13);
    } else if (preset === "executive-sleek") {
      setFontTheme("modern-sans");
      setFontSize(10);
      setLineHeight(1.25);
      setMargins(0.65);
      setSectionSpacing(11);
    } else if (preset === "editorial-crisp") {
      setFontTheme("editorial-lora");
      setFontSize(10);
      setLineHeight(1.3);
      setMargins(0.65);
      setSectionSpacing(11);
    } else if (preset === "compact-efficient") {
      setFontTheme("classic-serif");
      setFontSize(9);
      setLineHeight(1.15);
      setMargins(0.45);
      setSectionSpacing(6);
    }
  };

  const handleAutoFit1Page = () => {
    applyPreset("compact-efficient");
  };

  const [accentTheme, setAccentTheme] = useState<"sky" | "indigo" | "teal" | "emerald">("sky");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all modifications to her original resume content?")) {
      saveUserResume(initialResumeData);
      setFontSize(9.5);
      setLineHeight(1.2);
      setMargins(0.55);
      setSectionSpacing(8);
      setFontTheme("classic-serif");
      setShowIcons(false);
    }
  };

  const handleJsonExport = () => {
    const jsonStr = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resumeData.personalInfo.name.replace(/\s+/g, "_")}_AI_Interactive_Resume.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as ResumeData;
        if (json.personalInfo && json.education && json.skills && json.projects) {
          saveUserResume(json);
          alert("Resume details loaded successfully into your profile!");
        } else {
          alert("Invalid file structure. Make sure this is a valid interactive resume JSON file.");
        }
      } catch (err) {
        alert("Failed to read JSON backup file.");
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  // -------------------------------------------------------------
  // E. AUTHENTICATION OPERATIONS
  // -------------------------------------------------------------
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const term = usernameInput.trim();
    if (!term) {
      setAuthError("Username is required.");
      return;
    }

    const pass = passwordInput.trim();
    if (!pass) {
      setAuthError("Password is required.");
      return;
    }

    if (authMode === "login") {
      // Find account
      const found = accounts.find((a) => a.username.toLowerCase() === term.toLowerCase());
      if (found) {
        // Validate password
        if (found.password && found.password !== pass) {
          setAuthError("Incorrect password. Please verify your credentials.");
          return;
        }
        
        setCurrentUser(found);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(found));
        setShowAuthModal(false);
        // Reset dynamic fields
        setUsernameInput("");
        setEmailInput("");
        setPasswordInput("");
      } else {
        setAuthError(`Account with username "${usernameInput}" not found. Try creating a new one!`);
      }
    } else {
      // Register account
      const exists = accounts.some((a) => a.username.toLowerCase() === term.toLowerCase());
      if (exists) {
        setAuthError("An account with this username already exists.");
        return;
      }

      if (pass.length < 4) {
        setAuthError("Password must be at least 4 characters.");
        return;
      }

      const emailVal = emailInput.trim() || `${term.toLowerCase()}@gmail.com`;
      const newAcc: UserAccount = {
        username: usernameInput.trim(),
        email: emailVal,
        password: pass,
        resumeData: blankResumeData
      };

      const updatedAccounts = [...accounts, newAcc];
      setAccounts(updatedAccounts);
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));

      setCurrentUser(newAcc);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newAcc));
      setShowAuthModal(false);

      // Reset dynamic fields
      setUsernameInput("");
      setEmailInput("");
      setPasswordInput("");
    }
  };

  const handleDemoSignIn = (username: string) => {
    let found = accounts.find((a) => a.username.toLowerCase() === username.toLowerCase());
    
    if (!found && username.toLowerCase() === "guest") {
      const guestAcc: UserAccount = {
        username: "guest",
        email: "guest@example.com",
        password: "guest",
        resumeData: initialResumeData
      };
      
      setAccounts(prev => {
        const list = [...prev, guestAcc];
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(list));
        return list;
      });
      found = guestAcc;
    }

    if (found) {
      setUsernameInput(found.username);
      setPasswordInput(username.toLowerCase() === "khushi" ? "Khushi@123" : (found.password || ""));
      setAuthError("");
      
      setCurrentUser(found);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(found));
      setShowAuthModal(false);
      
      setUsernameInput("");
      setPasswordInput("");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setChatOpen(false);
  };

  // -------------------------------------------------------------
  // F. BOT CHAT SYSTEM
  // -------------------------------------------------------------
  const handleSendChat = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customPrompt || chatMessage.trim();
    if (!promptToSend) return;

    if (!customPrompt) setChatMessage("");

    // Add user message
    const updatedHistory = [
      ...chatHistory,
      { role: "user" as const, text: promptToSend }
    ];
    setChatHistory(updatedHistory);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory.slice(-10), // Send last 10 messages context
          currentResume: resumeData
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const textResponse = data.text || "I was unable to process that request.";
        
        // Check for suggested resume modifications mapping
        let suggestedData: Partial<ResumeData> | null = null;
        try {
          const blockMatch = textResponse.match(/```json_apply\n([\s\S]*?)\n```/);
          if (blockMatch && blockMatch[1]) {
            suggestedData = JSON.parse(blockMatch[1].trim());
          }
        } catch (e) {
          console.error("Failed to parse suggested data from AI blocks:", e);
        }

        setChatHistory(prev => [
          ...prev,
          { role: "assistant", text: textResponse, suggestedData }
        ]);
      } else {
        setChatHistory(prev => [
          ...prev,
          { role: "assistant", text: `⚠️ Server Error: ${data.error || "Problem connecting to AI"}` }
        ]);
      }
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        { role: "assistant", text: "❌ Connection Failure: Please make sure your server is online and port variable is running." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Apply suggestion callback
  const handleApplySuggestion = (idx: number, dataToApply: Partial<ResumeData>) => {
    const merged = {
      ...resumeData,
      ...dataToApply,
      personalInfo: {
        ...resumeData.personalInfo,
        ...(dataToApply.personalInfo || {})
      }
    };
    saveUserResume(merged);

    // Update history box to flag that it's been applied
    setChatHistory(prev => prev.map((item, i) => {
      if (i === idx) {
        return { ...item, applied: true };
      }
      return item;
    }));
  };

  // Setup UI Theme Colors
  const isDark = workspaceTheme === "dark";

  const mainBgClass = isDark
    ? "min-h-screen bg-[#111112] text-[#f4f4f3] flex flex-col font-sans select-text antialiased transition-colors duration-200"
    : "min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#e0f2fe] to-[#f5f3ff] text-slate-800 flex flex-col font-sans select-text antialiased transition-colors duration-200 bg-no-repeat bg-cover";

  const headerClass = isDark
    ? "no-print shrink-0 border-b border-zinc-850 bg-[#111112]/95 backdrop-blur px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-0 z-50 transition-colors duration-205"
    : "no-print shrink-0 border-b border-slate-100 bg-white/75 backdrop-blur-md px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-0 z-50 shadow-[0_2px_20px_rgba(99,102,241,0.02)] transition-colors duration-205 text-slate-800";

  const accentBorderTextClass = isDark
    ? "text-zinc-300 border-zinc-800 bg-zinc-950/50"
    : "text-slate-800 border-slate-200 bg-white/60 backdrop-blur-md";

  const sidebarClass = isDark
    ? "lg:col-span-12 xl:col-span-5 flex flex-col gap-6 text-[#ebd9cd]"
    : "lg:col-span-12 xl:col-span-5 flex flex-col gap-6 text-slate-800";

  const titleTextClass = isDark ? "text-neutral-50 font-display" : "text-slate-900 font-display font-extrabold";
  const subTitleTextClass = isDark ? "text-neutral-400 font-mono" : "text-slate-500 font-mono";

  const cardBgClass = isDark
    ? "w-full bg-zinc-900/90 border border-zinc-805 rounded-2xl p-4 space-y-4 shadow-xl text-left transition-colors duration-205"
    : "w-full bg-white/70 backdrop-blur-md border border-white/60 shadow-[0_8px_32px_rgba(99,102,241,0.02)] hover:shadow-[0_20px_40px_rgba(99,102,241,0.06)] hover:border-indigo-100/80 rounded-3xl p-6 space-y-4 text-left text-slate-700 transition-all duration-300 hover:-translate-y-0.5";

  const textLabelClass = isDark ? "text-neutral-400 font-semibold text-[11px]" : "text-slate-500 font-bold text-[11px]";
  const selectElementClass = isDark
    ? "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-neutral-250 focus:outline-none focus:border-zinc-700 cursor-pointer"
    : "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer shadow-2xs transition-all duration-200";

  const sectionSubHeadingClass = isDark
    ? "text-[11px] font-bold tracking-widest uppercase text-neutral-300 font-mono flex items-center gap-1.5"
    : "text-[11px] font-black tracking-widest uppercase text-indigo-950 font-mono flex items-center gap-1.5";

  const previewColumnBgClass = isDark
    ? "flex flex-col items-center bg-zinc-905/10 rounded-2xl border border-zinc-850 p-4 lg:h-[calc(100vh-110px)] lg:min-h-[500px] lg:max-h-[900px] lg:overflow-y-auto w-full style-scroll"
    : "flex flex-col items-center bg-slate-50/40 backdrop-blur-sm rounded-3xl border border-white/40 p-6 lg:h-[calc(100vh-110px)] lg:min-h-[500px] lg:max-h-[900px] lg:overflow-y-auto w-full shadow-inner style-scroll";

  const presetBtnClass = (active: boolean) => {
    if (active) {
      return isDark
        ? "px-2 py-1.5 rounded-xl font-bold text-xs tracking-wide border transition-all text-center cursor-pointer bg-sky-500/15 text-sky-405 border-sky-500/40 font-extrabold"
        : "px-2 py-1.5 rounded-xl font-bold text-xs tracking-wide border transition-all text-center cursor-pointer bg-indigo-600 text-white border-indigo-650 font-extrabold shadow-sm";
    }
    return isDark
      ? "px-2 py-1.5 rounded-xl font-bold text-xs tracking-wide border transition-all text-center cursor-pointer bg-slate-950/65 hover:bg-slate-955 text-slate-300 border-slate-800 hover:border-slate-755"
      : "px-2 py-1.5 rounded-xl font-bold text-xs tracking-wide border transition-all text-center cursor-pointer bg-white hover:bg-slate-55 text-slate-700 border-slate-200 shadow-2xs hover:border-indigo-405 transition-all";
  };

  const pureAcademicBtnClass = showIcons
    ? (isDark 
        ? "w-full py-1.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-sky-500/10 text-sky-400 border-sky-500/30 font-bold"
        : "w-full py-2 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-indigo-600 text-white border-indigo-650 font-bold shadow-md shadow-indigo-600/10")
    : (isDark
        ? "w-full py-1.5 px-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-slate-950 text-slate-400 border-slate-850 hover:text-slate-200"
        : "w-full py-2 px-4 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-white border-slate-250 text-slate-650 hover:text-indigo-650 hover:border-indigo-400 hover:bg-indigo-50/20 shadow-2xs");

  const buttonImportExportClass = isDark
    ? "flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold text-xs px-3 py-1.5 rounded-xl cursor-pointer transition-all hover:text-white"
    : "flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 text-slate-655 hover:text-indigo-655 shadow-2xs transition-all duration-200 hover:-translate-y-0.25";

  // -------------------------------------------------------------
  // RENDER PRODUCT LANDING DASHBOARD (IF GUEST/NOT LOGGED IN)
  // -------------------------------------------------------------
  if (!currentUser) {
    const isDark = workspaceTheme === "dark";

    const landingBgClass = isDark
      ? "min-h-screen bg-[#0b0c10] text-[#f4f4f3] flex flex-col font-sans select-text antialiased transition-colors duration-200 relative overflow-hidden"
      : "min-h-screen bg-gradient-to-br from-[#eff6ff] via-[#dbeafe] to-[#faf5ff] text-slate-800 flex flex-col font-sans select-text antialiased transition-colors duration-200 relative overflow-hidden bg-no-repeat bg-cover";

    return (
      <div className={landingBgClass}>
        {/* Glowing background blur circles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className={`absolute top-[-15%] left-[-15%] w-[65vw] h-[65vw] rounded-full blur-[120px] animate-pulse duration-[8s] ${
            isDark ? "bg-indigo-500/10" : "bg-gradient-to-tr from-sky-400/35 to-indigo-400/35"
          }`} />
          <div className={`absolute bottom-[-15%] right-[-15%] w-[75vw] h-[75vw] rounded-full blur-[140px] animate-pulse duration-[10s] ${
            isDark ? "bg-purple-500/10" : "bg-gradient-to-tr from-violet-300/30 to-purple-400/30"
          }`} />
        </div>

        {/* ================= HEADER BAR ================= */}
        <header className={isDark 
          ? "no-print shrink-0 border-b border-zinc-850 bg-[#0e0e10]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors"
          : "no-print shrink-0 border-b border-indigo-100/50 bg-white/40 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-[0_2px_20px_rgba(99,102,241,0.02)] transition-colors text-slate-800"
        }>
          <div className="flex items-center gap-2.5 text-left select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-sky-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-indigo-600 block">
                RESUME AI SPARK
              </span>
              <p className={`text-[9.5px] -mt-0.5 ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                Interactive CV Ecosystem
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setWorkspaceTheme(isDark ? "light" : "dark")}
              className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                isDark
                  ? "bg-zinc-900 border-zinc-800 text-amber-400 hover:text-amber-300 hover:bg-zinc-850"
                  : "bg-white/40 border-indigo-100 text-slate-705 hover:text-indigo-600 hover:border-indigo-400 hover:bg-white/60 shadow-2xs"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* ================= MAIN HERO & DASHBOARD OVERVIEW ================= */}
        <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 max-w-7xl mx-auto w-full px-6 py-12 gap-12 relative z-10 items-start">
          
          {/* LEFT COLUMN: PRODUCT PRESENTATION */}
          <div className="lg:col-span-7 flex flex-col space-y-8 text-left">
            <div className="space-y-4">
              <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[10.5px] font-mono tracking-widest font-extrabold uppercase select-none ${
                isDark ? "border-sky-500/20 bg-sky-500/5 text-sky-400" : "border-indigo-200 bg-indigo-50/50 text-indigo-600 shadow-2xs"
              }`}>
                <Zap size={11} className="animate-bounce" />
                Next Generation Studio
              </div>

              <h1 className={`text-4xl sm:text-5xl font-black leading-tight tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Craft Resumes that Land{" "}
                <span className={`bg-clip-text text-transparent bg-gradient-to-r ${isDark ? "from-sky-400 via-sky-300 to-indigo-400" : "from-indigo-600 via-violet-600 to-sky-550"} drop-shadow-xs`}>
                  Top Tech Roles
                </span>
              </h1>

              <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                Welcome to <strong className="font-bold">Resume AI Spark</strong>, an elite interactive CV ecosystem. 
                Move beyond static templates with real-time PDF builders, smart page-overflow budget checkers, 
                isolated account workspaces, and a smart AI chatbot companion that proofreads and applies metric rewrites in 1-click.
              </p>
            </div>

            {/* INTERACTIVE DEMO SANDBOX WIDGET */}
            <div className={`w-full border rounded-3xl p-5 space-y-4 transition-all duration-300 shadow-xl ${
              isDark ? "bg-zinc-900/90 border-zinc-800" : "bg-white/40 border-white/50 backdrop-blur-xl shadow-indigo-500/5"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200/50 dark:border-zinc-800 gap-2">
                <h3 className={`text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5 ${isDark ? "text-slate-350" : "text-slate-700"}`}>
                  <Sliders size={13} className="text-sky-500 animate-pulse" />
                  Live Feature Showcase Sandbox
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Click tabs below to test live features</span>
              </div>

              {/* Tab Selector */}
              <div className={`p-1 rounded-2xl border flex items-center gap-1 ${isDark ? "bg-zinc-950 border-zinc-800" : "bg-slate-100/50 border-slate-200/60"}`}>
                <button
                  type="button"
                  onClick={() => setLandingDemoTab("chat")}
                  className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    landingDemoTab === "chat"
                      ? (isDark ? "bg-zinc-850 text-white shadow-xs" : "bg-indigo-650 text-white shadow-sm")
                      : (isDark ? "text-zinc-400 hover:text-white" : "text-slate-600 hover:text-indigo-650")
                  }`}
                >
                  💬 AI Chat Expert
                </button>
                <button
                  type="button"
                  onClick={() => setLandingDemoTab("spacing")}
                  className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    landingDemoTab === "spacing"
                      ? (isDark ? "bg-zinc-850 text-white shadow-xs" : "bg-indigo-655 text-white shadow-sm")
                      : (isDark ? "text-zinc-400 hover:text-white" : "text-slate-605 hover:text-indigo-655")
                  }`}
                >
                  🗜️ Spacing Tuner
                </button>
                <button
                  type="button"
                  onClick={() => setLandingDemoTab("lens")}
                  className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    landingDemoTab === "lens"
                      ? (isDark ? "bg-zinc-850 text-white shadow-xs" : "bg-indigo-650 text-white shadow-sm")
                      : (isDark ? "text-zinc-400 hover:text-white" : "text-slate-600 hover:text-indigo-650")
                  }`}
                >
                  🔍 Detail Lens
                </button>
              </div>

              {/* Tab Content 1: AI Chatbot */}
              {landingDemoTab === "chat" && (
                <div className="space-y-3">
                  <div className={`h-40 rounded-2xl p-4 overflow-y-auto space-y-3 text-[11px] flex flex-col ${
                    isDark ? "bg-zinc-950/60 border border-zinc-850" : "bg-slate-50/70 border border-slate-200/50 shadow-inner text-slate-700"
                  }`}>
                    {demoChatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex gap-2 max-w-[90%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                          msg.role === "user" ? "bg-slate-200 border-slate-300 text-slate-705" : "bg-sky-500/10 border-sky-500/20 text-sky-400"
                        }`}>
                          {msg.role === "user" ? <User size={10} /> : <Bot size={10} />}
                        </div>
                        <div className={`p-2.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white rounded-tr-none font-medium text-left"
                            : isDark ? "bg-zinc-900 border border-zinc-800 rounded-tl-none text-zinc-300 text-left" : "bg-white border border-slate-200 rounded-tl-none text-slate-700 shadow-2xs text-left"
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {demoIsTyping && (
                      <div className="flex gap-2 mr-auto items-center">
                        <div className="w-5 h-5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center animate-pulse">
                          <Bot size={10} />
                        </div>
                        <span className="text-[10px] text-slate-500 animate-pulse">Spark AI is polishing summary bullets...</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] text-slate-500">Simulate how Spark AI refines descriptions in real-time</span>
                    <button
                      type="button"
                      onClick={handleDemoChatAction}
                      disabled={demoIsTyping || demoChatHistory.length > 2}
                      className="bg-sky-500 hover:bg-sky-450 disabled:opacity-50 text-white font-extrabold text-[10.5px] px-3.5 py-2 rounded-xl shadow cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Sparkles size={11} />
                      Boost summary points
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Spacing Tuner */}
              {landingDemoTab === "spacing" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10.5px] font-bold uppercase tracking-wider font-mono">
                        <span className={isDark ? "text-slate-400" : "text-slate-500"}>Font Size</span>
                        <span className="text-sky-500 font-extrabold">{demoFontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="14"
                        value={demoFontSize}
                        onChange={(e) => setDemoFontSize(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10.5px] font-bold uppercase tracking-wider font-mono">
                        <span className={isDark ? "text-slate-400" : "text-slate-505"}>Section Gaps</span>
                        <span className="text-sky-500 font-extrabold">{demoSectionSpacing}px</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="24"
                        value={demoSectionSpacing}
                        onChange={(e) => setDemoSectionSpacing(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>
                  </div>

                  <div className={`border rounded-2xl p-4 overflow-hidden flex flex-col justify-between transition-all ${
                    isDark ? "bg-zinc-950/60 border-zinc-850" : "bg-slate-50/70 border-slate-200/50 shadow-inner"
                  }`}>
                    <div 
                      className="bg-white rounded-lg p-3 shadow-md border border-slate-200 text-left transition-all duration-150 select-none overflow-hidden text-slate-700"
                      style={{ fontSize: `${demoFontSize}px` }}
                    >
                      <h4 className="font-extrabold border-b pb-0.5 text-slate-800 tracking-tight uppercase" style={{ fontSize: `${demoFontSize + 2}px` }}>
                        John Doe
                      </h4>
                      <p className="text-slate-500 font-medium leading-snug mt-1">
                        Systems Architect specialized in cloud platforms.
                      </p>
                      
                      <div className="border-t pt-1 font-semibold uppercase text-slate-700 font-mono tracking-wider mt-2" style={{ fontSize: `${demoFontSize - 1.5}px` }}>
                        Experience
                      </div>
                      
                      <div className="space-y-1" style={{ marginTop: `${demoSectionSpacing / 3}px` }}>
                        <div className="flex justify-between text-slate-850 font-bold" style={{ fontSize: `${demoFontSize - 0.5}px` }}>
                          <span>Senior Backend Lead</span>
                          <span className="font-normal text-slate-500">2024 - Present</span>
                        </div>
                        <p className="text-slate-500 text-[0.85em] leading-relaxed">
                          • Optimized REST queries by 35% and scaled cluster database throughput.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 3: Detail Lens */}
              {landingDemoTab === "lens" && (
                <div className="space-y-3">
                  <p className={`text-[10px] uppercase font-mono tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Hover mouse over the card below to see the live magnifier zoom text instantly!
                  </p>

                  <div 
                    className={`relative border rounded-2xl p-6 flex items-center justify-center transition-all overflow-hidden cursor-crosshair ${
                      isDark ? "bg-zinc-950/60 border-zinc-850" : "bg-slate-50/70 border-slate-200/50 shadow-inner"
                    }`}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const px = rect.width ? x / rect.width : 0;
                      const py = rect.height ? y / rect.height : 0;
                      setDemoLensCoords({ x, y, px, py });
                    }}
                    onMouseEnter={() => setDemoLensActive(true)}
                    onMouseLeave={() => setDemoLensActive(false)}
                  >
                    <div className="text-center space-y-1.5 select-none pointer-events-none">
                      <div className="font-extrabold text-[8px] text-slate-400 uppercase tracking-widest">Interactive Lens Sandbox</div>
                      <div className="font-bold text-[10px] text-slate-500">This simulates details magnification at scale.</div>
                      <div className="text-[6.5px] text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi pellentesque nibh a interdum convallis. Aliquam vestibulum feugiat risus.
                      </div>
                    </div>

                    {demoLensActive && (() => {
                      const magScale = 2.1;
                      return (
                        <div
                          className="absolute pointer-events-none rounded-full border-3 border-sky-500 bg-white z-[100] overflow-hidden"
                          style={{
                            width: "120px",
                            height: "120px",
                            left: `${demoLensCoords.x - 60}px`,
                            top: `${demoLensCoords.y - 60}px`,
                            boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
                          }}
                        >
                          <div
                            className="absolute origin-top-left text-center space-y-3 pointer-events-none"
                            style={{
                              transform: `scale(${magScale})`,
                              left: `${60 - demoLensCoords.px * 320 * magScale}px`,
                              top: `${60 - demoLensCoords.py * 120 * magScale}px`,
                              width: "320px",
                              height: "120px",
                              backgroundColor: "white",
                              paddingTop: "20px"
                            }}
                          >
                            <div className="font-extrabold text-[8px] text-sky-600 uppercase tracking-widest">Interactive Lens Sandbox</div>
                            <div className="font-bold text-[10px] text-indigo-900">This simulates details magnification at scale.</div>
                            <div className="text-[6.5px] text-slate-800 max-w-[280px] mx-auto leading-relaxed">
                              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi pellentesque nibh a interdum convallis. Aliquam vestibulum feugiat risus.
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Checklist highlights */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <div className={`p-1 rounded-md ${isDark ? "bg-sky-500/10 text-sky-400" : "bg-indigo-50 text-indigo-650 border border-indigo-100/50 shadow-2xs"}`}>
                  <CheckCircle size={13} />
                </div>
                <span className={isDark ? "text-slate-300" : "text-slate-700"}>Instant AI Chat Expert</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <div className={`p-1 rounded-md ${isDark ? "bg-sky-500/10 text-sky-400" : "bg-indigo-50 text-indigo-655 border border-indigo-100/50 shadow-2xs"}`}>
                  <CheckCircle size={13} />
                </div>
                <span className={isDark ? "text-slate-300" : "text-slate-700"}>Live Spacing & Spacing Tuner</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <div className={`p-1 rounded-md ${isDark ? "bg-sky-500/10 text-sky-400" : "bg-indigo-50 text-indigo-650 border border-indigo-100/50 shadow-2xs"}`}>
                  <CheckCircle size={13} />
                </div>
                <span className={isDark ? "text-slate-305" : "text-slate-700"}>circular Lens detail Reader</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <div className={`p-1 rounded-md ${isDark ? "bg-sky-500/10 text-sky-400" : "bg-indigo-50 text-indigo-655 border border-indigo-100/50 shadow-2xs"}`}>
                  <CheckCircle size={13} />
                </div>
                <span className={isDark ? "text-slate-305" : "text-slate-700"}>Isolated Multi-User Sandboxes</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AUTHENTICATION PANEL */}
          <div className="lg:col-span-5 w-full flex flex-col justify-center">
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative text-left w-full ${
              isDark ? "bg-zinc-900 border-zinc-800" : "bg-white/40 border-white/50 backdrop-blur-xl shadow-[0_10px_40px_rgba(99,102,241,0.04)] text-slate-750"
            }`}>
              
              {/* Tab Selector for Login/Register */}
              <div className="flex justify-between items-center mb-6 border-b pb-4 border-slate-200/50 dark:border-zinc-800">
                <div>
                  <h2 className={`text-lg font-bold tracking-tight ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                    {authMode === "login" ? "Account Sign In" : "Register Profile"}
                  </h2>
                  <p className={`text-[10px] font-mono mt-0.5 uppercase tracking-wider ${isDark ? "text-neutral-400" : "text-indigo-600 font-bold"}`}>
                    {authMode === "login" ? "Workspace Access" : "Create Sandbox Profile"}
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "register" : "login");
                    setAuthError("");
                  }}
                  className="text-sky-500 font-extrabold hover:underline text-xs tracking-wide cursor-pointer"
                >
                  {authMode === "login" ? "Register instead" : "Sign in instead"}
                </button>
              </div>

              {/* Authentication Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-650 font-medium">
                    ⚠️ {authError}
                  </div>
                )}

                <div className="space-y-1 text-left">
                  <label className={`block text-[10px] font-mono tracking-wider font-bold uppercase ${isDark ? "text-neutral-400" : "text-slate-505"}`}>
                    Username
                  </label>
                  <input
                    type="text"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none placeholder:text-neutral-450 ${
                      isDark 
                        ? "bg-zinc-950 border-zinc-800 text-neutral-100 focus:border-zinc-705" 
                        : "bg-white/50 border-indigo-200/60 text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-2xs"
                    }`}
                    placeholder="e.g. khushi"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    required
                  />
                </div>

                {authMode === "register" && (
                  <div className="space-y-1 text-left">
                    <label className={`block text-[10px] font-mono tracking-wider font-bold uppercase ${isDark ? "text-neutral-400" : "text-slate-505"}`}>
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none placeholder:text-neutral-455 ${
                        isDark 
                          ? "bg-zinc-955 border-zinc-800 text-neutral-100 focus:border-zinc-705" 
                          : "bg-white/50 border-indigo-200/60 text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-2xs"
                      }`}
                      placeholder="e.g. user@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-1 text-left">
                  <div className="flex justify-between items-center">
                    <label className={`block text-[10px] font-mono tracking-wider font-bold uppercase ${isDark ? "text-neutral-400" : "text-slate-505"}`}>
                      Password
                    </label>
                    {authMode === "login" && (
                      <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-400">
                        Try: <code className="font-bold">Khushi@123</code>
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none placeholder:text-neutral-400 ${
                      isDark 
                        ? "bg-zinc-950 border-zinc-800 text-neutral-100 focus:border-zinc-705" 
                        : "bg-white/50 border-indigo-200/60 text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-2xs"
                    }`}
                    placeholder={authMode === "login" ? "Enter password" : "Configure password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-550 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-950 font-bold text-xs py-3 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-lg cursor-pointer transition-all active:scale-98 mt-2"
                >
                  <span>{authMode === "login" ? "Authenticate & Enter Workspace" : "Register Profile & Login"}</span>
                  <ArrowRight size={14} className="stroke-[2.5]" />
                </button>
              </form>

              {/* Demo Profile Quick Onboarding */}
              <div className="mt-6 pt-5 border-t border-slate-200/50 dark:border-zinc-850 flex flex-col gap-2">
                <span className={`text-[10px] font-mono tracking-wider font-bold uppercase ${isDark ? "text-neutral-400" : "text-slate-550"}`}>
                  Quick Demo Access:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn("khushi")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border font-bold text-[11px] transition-all cursor-pointer shadow-2xs ${
                      isDark 
                        ? "border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400" 
                        : "border-indigo-200 bg-white hover:bg-indigo-50/50 text-indigo-650 hover:border-indigo-400"
                    }`}
                  >
                    <UserCheck size={12} />
                    <span>Enter as Khushi</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn("guest")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border font-bold text-[11px] transition-all cursor-pointer shadow-2xs ${
                      isDark 
                        ? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400" 
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-705 hover:border-slate-350"
                    }`}
                  >
                    <Zap size={12} />
                    <span>Enter as Guest</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ================= PLATFORM FEATURE GRID ================= */}
        <section className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12 border-t border-slate-200/50 dark:border-zinc-800 mt-6">
          <div className="text-center space-y-3 mb-12">
            <h2 className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              Packed with Elite Professional Features
            </h2>
            <p className={`text-xs font-mono uppercase tracking-widest ${isDark ? "text-slate-400" : "text-indigo-600 font-bold"}`}>
              Engineered for modern software developers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className={`p-6 rounded-3xl border transition-all hover:-translate-y-1 shadow-md hover:shadow-lg ${
              isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white/40 border-white/50 backdrop-blur-md"
            }`}>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <h3 className={`text-sm font-bold mb-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                Gemini Resume Mentor
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Polishes experience bullet points, optimizes ATS keywords, and provides custom recommendations with a 1-click apply integration.
              </p>
            </div>

            {/* Feature 2 */}
            <div className={`p-6 rounded-3xl border transition-all hover:-translate-y-1 shadow-md hover:shadow-lg ${
              isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white/40 border-white/50 backdrop-blur-md"
            }`}>
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4">
                <Sliders size={20} />
              </div>
              <h3 className={`text-sm font-bold mb-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                Page Spacing & Budget Tuner
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Range inputs automatically recalculate margins, font sizes, line heights, and section paddings to fit your content on exactly 1 page.
              </p>
            </div>

            {/* Feature 3 */}
            <div className={`p-6 rounded-3xl border transition-all hover:-translate-y-1 shadow-md hover:shadow-lg ${
              isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white/40 border-white/50 backdrop-blur-md"
            }`}>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <Eye size={20} />
              </div>
              <h3 className={`text-sm font-bold mb-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                Detail circular Lens
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Inspect tiny print size layout details down to the point using our responsive cursor-following magnifying overlay glass.
              </p>
            </div>

            {/* Feature 4 */}
            <div className={`p-6 rounded-3xl border transition-all hover:-translate-y-1 shadow-md hover:shadow-lg ${
              isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white/40 border-white/50 backdrop-blur-md"
            }`}>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-550 flex items-center justify-center mb-4">
                <User size={20} />
              </div>
              <h3 className={`text-sm font-bold mb-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                Multi-User Sandboxes
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Safely register custom workspace handles, isolate drafts in secure database profiles, and manage JSON configurations.
              </p>
            </div>

            {/* Feature 5 */}
            <div className={`p-6 rounded-3xl border transition-all hover:-translate-y-1 shadow-md hover:shadow-lg ${
              isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white/40 border-white/50 backdrop-blur-md"
            }`}>
              <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center mb-4">
                <Printer size={20} />
              </div>
              <h3 className={`text-sm font-bold mb-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                Pristine PDF Exporter
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Compiles clean, print-ready corporate and academic resume sheets, adhering to rigid formatting requirements.
              </p>
            </div>

            {/* Feature 6 */}
            <div className={`p-6 rounded-3xl border transition-all hover:-translate-y-1 shadow-md hover:shadow-lg ${
              isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-white/40 border-white/50 backdrop-blur-md"
            }`}>
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                <Zap size={20} />
              </div>
              <h3 className={`text-sm font-bold mb-2 ${isDark ? "text-white" : "text-slate-800"}`}>
                Zero Coding Hassle
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Simply fill forms on the left, receive AI assistance, and download polished PDFs instantly.
              </p>
            </div>
          </div>
        </section>

        {/* ================= FAQ SECTION ================= */}
        <section className="relative z-10 max-w-4xl mx-auto w-full px-6 py-12 border-t border-slate-200/50 dark:border-zinc-800 text-left">
          <div className="text-center space-y-3 mb-10">
            <h2 className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              Frequently Asked Questions
            </h2>
            <p className={`text-xs font-mono uppercase tracking-widest ${isDark ? "text-slate-400" : "text-indigo-600 font-bold"}`}>
              Everything you need to know about Spark AI
            </p>
          </div>

          <div className="space-y-4">
            <div className={`p-5 rounded-2xl border ${
              isDark ? "bg-zinc-900/60 border-zinc-850" : "bg-white/40 border-white/50 backdrop-blur-md shadow-2xs"
            }`}>
              <h4 className={`text-sm font-bold mb-1.5 ${isDark ? "text-white" : "text-slate-800"}`}>
                🔒 Is my resume data secure?
              </h4>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Yes. All user accounts and resume drafts are saved locally inside your browser's private localStorage sandbox. We do not store or transmit your CV to any external databases.
              </p>
            </div>

            <div className={`p-5 rounded-2xl border ${
              isDark ? "bg-zinc-900/60 border-zinc-850" : "bg-white/40 border-white/50 backdrop-blur-md shadow-2xs"
            }`}>
              <h4 className={`text-sm font-bold mb-1.5 ${isDark ? "text-white" : "text-slate-800"}`}>
                🤖 How does the AI Resume Mentor work?
              </h4>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                The AI companion evaluates your resume fields and provides targeted recommendations. If you ask it to optimize summary text or bullets, it outputs an inline recommendation card with a "1-Click Apply" button to update your inputs automatically.
              </p>
            </div>

            <div className={`p-5 rounded-2xl border ${
              isDark ? "bg-zinc-900/60 border-zinc-850" : "bg-white/40 border-white/50 backdrop-blur-md shadow-2xs"
            }`}>
              <h4 className={`text-sm font-bold mb-1.5 ${isDark ? "text-white" : "text-slate-800"}`}>
                🗜️ Can I export and import my resume backups?
              </h4>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Absolutely. In your active builder workspace, you can click "Export" to download a JSON file containing all your inputs, which you can re-import on any device at a later time.
              </p>
            </div>
          </div>
        </section>

      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER MAIN WORKSPACE (IF LOGGED IN)
  // -------------------------------------------------------------
  return (
    <>
      <div className={`${mainBgClass} no-print`}>
      
      {/* ================= HEADER BAR (NO-PRINT) ================= */}
      <header className={headerClass}>
        {/* Title branding Block - Click to return to landing page */}
        <div 
          onClick={handleLogout}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleLogout();
            }
          }}
          role="button"
          tabIndex={0}
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer select-none"
          title="Go to Main Landing Page"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-sky-500/20 transition-transform group-hover:scale-105 animate-pulse">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400 group-hover:underline block">
              RESUME AI SPARK
            </span>
            <p className={`text-[9.5px] -mt-0.5 ${subTitleTextClass}`}>
              {currentUser ? (
                <>Welcome back, <span className="font-bold underline text-neutral-450 dark:text-neutral-200">{currentUser.username}</span></>
              ) : (
                <span className="font-bold text-sky-400">Guest Showcase Mode</span>
              )}
            </p>
          </div>
        </div>

        {/* Dynamic Theme / Accent Color selector & Workspace Toggler */}
        <div className="flex items-center gap-4 flex-wrap">
          
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={() => setWorkspaceTheme(isDark ? "light" : "dark")}
            className={`p-1.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold text-xs transition-all cursor-pointer ${
              isDark
                ? "bg-zinc-900 border-zinc-800 text-amber-400 hover:text-amber-300 hover:bg-zinc-850"
                : "bg-white border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-600/5 hover:-translate-y-0.25 shadow-2xs"
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={13} className="stroke-[2.5]" /> : <Moon size={13} className="stroke-[2.5]" />}
            <span className="text-[10.5px] font-sans tracking-wide">
              {isDark ? "Light" : "Dark"}
            </span>
          </button>

          {/* Controls group */}
          {currentUser ? (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Print/Save to PDF Button */}
              <button
                onClick={handlePrint}
                className={`flex items-center gap-1.5 font-bold text-xs px-4 py-2 rounded-xl shadow cursor-pointer transition-all active:scale-95 ${
                  isDark ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-550 hover:to-violet-550 text-white shadow-md shadow-indigo-600/10 hover:shadow-lg hover:shadow-indigo-600/15 hover:-translate-y-0.25"
                }`}
              >
                <Printer size={13} className="stroke-[2.5]" />
                Print / Save PDF
              </button>

              {/* Export JSON Details */}
              <button
                onClick={handleJsonExport}
                className={buttonImportExportClass}
                title="Download backup JSON metadata folder"
              >
                <Download size={13} />
                Export
              </button>

              {/* Import JSON Details */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className={buttonImportExportClass}
                title="Import backup JSON metadata folder"
              >
                <Upload size={13} />
                Import
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleJsonImport}
                accept=".json"
                className="hidden"
              />

              {/* AI Assistant Activator button */}
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={`flex items-center gap-1.5 font-bold text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                  chatOpen 
                    ? (isDark ? "bg-sky-500/15 border-sky-500/40 text-sky-400 font-extrabold" : "bg-indigo-50 border-indigo-200 text-indigo-600 font-extrabold shadow-2xs")
                    : (isDark ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white" : "bg-white border-slate-200 text-slate-655 hover:text-indigo-600 hover:border-indigo-400 shadow-2xs")
                }`}
              >
                <MessageSquare size={13} className={chatOpen ? "text-sky-405" : ""} />
                AI Assistant
              </button>

              {/* Log Out Button */}
              <button
                onClick={handleLogout}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isDark ? "border-rose-900/10 text-rose-400 hover:bg-rose-950/20" : "border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-250 shadow-2xs"
                }`}
                title="Exit current protected workspace profile"
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
                setShowAuthModal(true);
              }}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-lg hover:-translate-y-0.25 transition-all cursor-pointer"
            >
              <Zap size={13} />
              Sign In / Get Started
            </button>
          )}
        </div>

      </header>


      {/* ================= MAIN CONTAINER BODY ================= */}
      <main className="flex-1 p-4 lg:p-6 flex flex-col w-full max-w-[1750px] lg:px-8 xl:px-10 mx-auto relative">
        
        {/* Workspace Split Layout */}
        <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* Sidebar form editor controls (Left Column) */}
          {sidebarOpen && (
            <div className={sidebarClass}>

            {/* Real Resume Form Details Editor */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1 mb-1.5">
                <h3 className={`text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  <Sliders size={13} className="text-sky-505" />
                  Edit Resume Context
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Saves to profile
                </span>
              </div>
              
              <ResumeDataEditor
                data={resumeData}
                onChange={saveUserResume}
                onReset={handleReset}
                themeMode={workspaceTheme}
              />
            </div>

            {/* Spacing specifications tuner */}
            <div className={cardBgClass}>
              <div className="border-b pb-2 flex justify-between items-center border-slate-200/50 dark:border-slate-800">
                <h4 className={sectionSubHeadingClass}>
                  <Sliders size={11} className="text-sky-505" />
                  Elite Layout & Spacing Tuner
                </h4>
                <span className="text-[10px] font-mono text-slate-500">
                  Grid View
                </span>
              </div>

              {/* Grid format spacing options */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11.5px] font-medium">
                    <span className={textLabelClass}>Font Size</span>
                    <span className="font-mono text-sky-505 font-bold">{fontSize}pt</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="12.5"
                    step="0.5"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11.5px] font-medium">
                    <span className={textLabelClass}>Line Height</span>
                    <span className="font-mono text-sky-505 font-bold">{lineHeight}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="1.8"
                    step="0.05"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11.5px] font-medium">
                    <span className={textLabelClass}>Margins</span>
                    <span className="font-mono text-sky-505 font-bold">{margins}in</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="1.2"
                    step="0.05"
                    value={margins}
                    onChange={(e) => setMargins(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11.5px] font-medium">
                    <span className={textLabelClass}>Section Gaps</span>
                    <span className="font-mono text-sky-505 font-bold">{sectionSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="22"
                    step="1"
                    value={sectionSpacing}
                    onChange={(e) => setSectionSpacing(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>
              </div>

              {/* Responsive scaling zoom options */}
              <div className="pt-2.5 border-t border-slate-200/50 dark:border-slate-800 space-y-2">
                <div className="space-y-1">
                  <label className={`block text-[10px] font-bold uppercase tracking-wide font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Zoom Mode
                  </label>
                  <select
                    value={zoomMode}
                    onChange={(e) => setZoomMode(e.target.value as any)}
                    className={selectElementClass}
                  >
                    <option value="fit-width">📐 Fit Workspace Width</option>
                    <option value="fit-page">📄 Fit Single Page Height</option>
                    <option value="manual">⚙️ Manual Zoom Scale</option>
                  </select>
                </div>
                
                {zoomMode === "manual" && (
                  <div className="flex items-center gap-2.5 pt-1">
                    <span className={textLabelClass}>Zoom:</span>
                    <input
                      type="range"
                      min="0.4"
                      max="1.5"
                      step="0.05"
                      value={zoomScale}
                      onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <span className="font-mono text-sky-550 font-bold text-xs">{Math.round(zoomScale * 100)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Height Overflow Warning */}
            <div className={isOverflowing
              ? (isDark 
                  ? "w-full border border-amber-500/30 bg-amber-955/25 text-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left transition-all duration-300"
                  : "w-full border border-amber-300 bg-amber-50 text-amber-900 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left transition-all duration-300 shadow-sm")
              : (isDark
                  ? "w-full border border-emerald-500/20 bg-emerald-955/20 text-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left transition-all duration-300"
                  : "w-full border border-emerald-200 bg-emerald-50 text-emerald-950 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left transition-all duration-300 shadow-sm")
            }>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl flex items-center justify-center ${
                  isOverflowing 
                    ? "bg-amber-500/10 text-amber-550 border border-amber-500/20" 
                    : "bg-emerald-500/10 text-emerald-555 border border-emerald-500/20"
                }`}>
                  <Sliders size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold tracking-tight">
                    Page Budget: {isOverflowing ? "⚠️ Content Exceeds 1 Page" : "✅ Perfectly Fits 1 Page"}
                  </div>
                  <p className={`text-[10px] uppercase font-mono mt-0.5 ${isDark ? "text-slate-450" : "text-slate-500"}`}>
                    Currently utilizing {Math.ceil((documentHeight / 1056) * 100)}% of single-page height limit ({documentHeight}px / 1056px capacity)
                  </p>
                </div>
              </div>
              {isOverflowing && (
                <button
                  onClick={handleAutoFit1Page}
                  className="shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl shadow cursor-pointer transition-all active:scale-95 animate-pulse"
                >
                  ✨ Auto-Fit
                </button>
              )}
            </div>

            {/* Typography selection presets */}
            <div className={cardBgClass}>
              <div className="flex justify-between items-center border-b pb-2.5 border-slate-200/50 dark:border-slate-800">
                <h4 className={sectionSubHeadingClass}>
                  <Sparkles size={11} className="text-sky-505" />
                  Themes & Typography
                </h4>
                <span className="text-[9px] font-mono text-slate-500">
                  Custom Presets
                </span>
              </div>

              {/* Presets badges */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => applyPreset("academic-classic")}
                  className={presetBtnClass(fontTheme === "classic-serif" && fontSize === 10.5)}
                >
                  🏛️ Academic Classic
                </button>
                <button
                  onClick={() => applyPreset("executive-sleek")}
                  className={presetBtnClass(fontTheme === "modern-sans" && fontSize === 10)}
                >
                  💼 Executive Sans
                </button>
                <button
                  onClick={() => applyPreset("editorial-crisp")}
                  className={presetBtnClass(fontTheme === "editorial-lora" && fontSize === 10)}
                >
                  📰 Editorial Lora
                </button>
                <button
                  onClick={() => applyPreset("compact-efficient")}
                  className={presetBtnClass(fontTheme === "classic-serif" && fontSize === 9)}
                  title="Squeeze margins and elements spacing for an absolute 1-page fit"
                >
                  🗜️ Squeezed 1-Page
                </button>
              </div>

              {/* Typography selectors list */}
              <div className="grid grid-cols-1 gap-3 pt-1">
                <div className="space-y-1">
                  <label className={`block text-[10px] font-bold uppercase tracking-wide font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Typography Font Style
                  </label>
                  <select
                    value={fontTheme}
                    onChange={(e) => setFontTheme(e.target.value as any)}
                    className={selectElementClass}
                  >
                    <option value="classic-serif">🏛️ Cormorant Professional Serif</option>
                    <option value="modern-sans">💼 Source Sans & Inter (Modern)</option>
                    <option value="editorial-lora">📰 Lora Serif (Editorial)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`block text-[10px] font-bold uppercase tracking-wide font-mono mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Link Details Icons
                  </label>
                  <button
                    onClick={() => setShowIcons(!showIcons)}
                    className={pureAcademicBtnClass}
                  >
                    {showIcons ? "✓ Contact Icons Enabled" : "表达 Academic Type (No Icons)"}
                  </button>
                </div>
              </div>
            </div>

          </div>
          )}

          {/* Realtime visual workspace panel (Right Column) */}
          <div 
            ref={previewContainerRef}
            className={`${sidebarOpen ? "lg:col-span-12 xl:col-span-7" : "lg:col-span-12 xl:col-span-12"} lg:sticky lg:top-24 ${previewColumnBgClass}`}
          >
            {/* Document Interactive Controller Toolbar */}
            <div className={`w-full mb-4 p-2.5 rounded-2xl border flex flex-col xl:flex-row items-center justify-between gap-3 text-xs ${
              isDark ? "bg-slate-950/80 border-slate-900 text-slate-300" : "bg-white border-slate-205 text-slate-705 shadow-sm"
            }`}>
              {/* Visual indicator */}
              <div className="flex items-center gap-2 font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono uppercase text-[10px] tracking-wider text-sky-400">Pristine Live Page Preview</span>
              </div>

              {/* Main controls group */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                
                {/* Collapse / Expand Sidebar Toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`px-2.5 py-1.5 rounded-xl border font-bold text-[10.5px] tracking-wide cursor-pointer transition-all flex items-center gap-1.5 ${
                    sidebarOpen
                      ? isDark
                        ? "bg-slate-900/60 border-slate-850 text-slate-400 hover:text-white"
                        : "bg-slate-50 border-slate-250 text-slate-600 hover:text-slate-955 shadow-xs"
                      : "bg-sky-500/15 border-sky-500/40 text-sky-400 font-extrabold shadow-xs"
                  }`}
                  title={sidebarOpen ? "Hide editor sidebar to expand resume preview" : "Show editor sidebar to edit data"}
                >
                  <Columns size={12.5} />
                  <span>{sidebarOpen ? "Hide Editor" : "Show Editor"}</span>
                </button>

                <div className={`h-4 w-[1px] ${isDark ? "bg-slate-850" : "bg-slate-205"}`} />

                {/* Switch Hover Magnification tool */}
                <button
                  onClick={() => setMagnifierEnabled(!magnifierEnabled)}
                  className={`px-2.5 py-1.5 rounded-xl border font-bold text-[10.5px] tracking-wide cursor-pointer transition-all flex items-center gap-1.5 ${
                    magnifierEnabled
                      ? "bg-sky-500/15 border-sky-500/45 text-sky-400 font-extrabold shadow-xs"
                      : isDark
                        ? "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-250 cursor-pointer"
                        : "bg-slate-50 border-slate-250 text-slate-500 hover:text-slate-750 cursor-pointer shadow-xs"
                  }`}
                  title="Move mouse over resume to magnify and read tiny text instantly"
                >
                  <Eye size={12.5} className={magnifierEnabled ? "text-sky-400 stroke-[2.5]" : "text-slate-400"} />
                  <span>Hover Magnifier {magnifierEnabled ? "ON" : "OFF"}</span>
                </button>

                <div className={`h-4 w-[1px] ${isDark ? "bg-slate-850" : "bg-slate-205"}`} />

                {/* Zoom Mode Selector Button Group */}
                <div className={`flex items-center gap-0.5 p-0.5 rounded-xl border ${
                  isDark ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-250 shadow-xs"
                }`}>
                  <button
                    onClick={() => setZoomMode("fit-width")}
                    className={`px-2 py-1.5 rounded-lg font-bold text-[10.5px] tracking-wide cursor-pointer transition-all ${
                      zoomMode === "fit-width"
                        ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                        : isDark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Fit to workspace width (Recommended)"
                  >
                    Fit Width
                  </button>
                  <button
                    onClick={() => setZoomMode("fit-page")}
                    className={`px-2.5 py-1.5 rounded-lg font-bold text-[10.5px] tracking-wide cursor-pointer transition-all ${
                      zoomMode === "fit-page"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : isDark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Fit full page height to screen"
                  >
                    Fit Page
                  </button>
                </div>

                {/* Manual Zoom buttons */}
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-xl border ${
                  isDark ? "bg-slate-900/40 border-slate-850" : "bg-slate-50 border-slate-250 shadow-xs"
                }`}>
                  <button
                    onClick={() => {
                      setZoomMode("manual");
                      setZoomScale(prev => Math.max(prev - 0.05, 0.4));
                    }}
                    className={`p-1.5 rounded-lg transition-all ${
                      isDark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                    } cursor-pointer`}
                    title="Zoom Out"
                  >
                    <ZoomOut size={13} className="stroke-[2.5]" />
                  </button>

                  <span className="font-mono text-[11px] font-bold min-w-[38px] text-center">
                    {Math.round(effectiveZoom * 100)}%
                  </span>

                  <button
                    onClick={() => {
                      setZoomMode("manual");
                      setZoomScale(prev => Math.min(prev + 0.05, 1.5));
                    }}
                    className={`p-1.5 rounded-lg transition-all ${
                      isDark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                    } cursor-pointer`}
                    title="Zoom In"
                  >
                    <ZoomIn size={13} className="stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Helpful Tip Badge */}
              <div className="hidden xl:flex items-center gap-1 font-mono text-[9.5px] text-slate-500 tracking-wide">
                <span>💡 Tip:</span>
                <span className={isDark ? "text-slate-400" : "text-slate-600"}>Hover over page to magnify text!</span>
              </div>
            </div>

            {/* Simulated letter paper sheet */}
            <div className="w-full overflow-x-auto flex justify-center py-0.5 select-text">
              <div 
                className={`relative overflow-visible mx-auto flex justify-center py-2 shrink-0 rounded-sm bg-white ${
                  isDark ? "shadow-2xl border border-slate-850" : "shadow-md border border-slate-200"
                }`}
                style={{
                  width: `${8.5 * effectiveZoom}in`,
                  height: `${documentHeight * effectiveZoom}px`,
                  transition: "width 0.15s, height 0.15s"
                }}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setLensActive(true)}
                onMouseLeave={() => setLensActive(false)}
              >
                <div 
                  className="origin-top shrink-0 transition-transform duration-300"
                  style={{
                    transform: `scale(${effectiveZoom})`,
                    transformOrigin: "top center",
                    width: "8.5in",
                    position: "absolute",
                    top: 0
                  }}
                >
                  <LatexPrintView
                    data={resumeData}
                    fontSize={fontSize}
                    lineHeight={lineHeight}
                    margins={margins}
                    sectionSpacing={sectionSpacing}
                    fontTheme={fontTheme}
                    showIcons={showIcons}
                  />
                </div>

                {/* Circular Magnifying Glass Lens overlay */}
                {magnifierEnabled && lensActive && (() => {
                  const magFactor = 1.95;
                  const magScale = Math.max(effectiveZoom * magFactor, 1.15);
                  return (
                    <div
                      className="absolute pointer-events-none rounded-full border-3 border-sky-500 bg-white z-[100] overflow-hidden"
                      style={{
                        width: "220px",
                        height: "220px",
                        left: `${lensCoords.x - 110}px`,
                        top: `${lensCoords.y - 110}px`,
                        boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.55), 0 0 24px 3px rgba(14, 165, 233, 0.3)"
                      }}
                    >
                      <div
                        className="absolute origin-top-left"
                        style={{
                          transform: `scale(${magScale})`,
                          left: `${110 - lensCoords.px * 8.5 * 96 * magScale}px`,
                          top: `${110 - lensCoords.py * documentHeight * magScale}px`,
                          width: "816px",
                          height: `${documentHeight}px`,
                          transformOrigin: "top left",
                          position: "absolute",
                          backgroundColor: "white",
                        }}
                      >
                        <LatexPrintView
                          data={resumeData}
                          fontSize={fontSize}
                          lineHeight={lineHeight}
                          margins={margins}
                          sectionSpacing={sectionSpacing}
                          fontTheme={fontTheme}
                          showIcons={showIcons}
                        />
                      </div>

                      {/* Circular target/crosshair in the center of the lens */}
                      <div className="absolute inset-0 border border-sky-400/20 rounded-full flex items-center justify-center pointer-events-none">
                        <div className="w-2 h-2 rounded-full border border-sky-500/40 bg-sky-500/10" />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* ============================================================= */}
      {/* G. FLOATING CHAT COMPANION ELEMENT (PERSISTENT BUTTON & DRAWER) */}
      {/* ============================================================= */}
      <div className="fixed bottom-6 right-6 z-[1000] no-print">
        {/* Toggle Chat Button */}
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-neutral-850 dark:border-neutral-200 flex items-center justify-center relative group"
            title="Open AI Resume Assistant"
          >
            <MessageSquare size={22} className="group-hover:rotate-6 transition-transform" />
          </button>
        ) : (
          /* Floating Drawer Panel */
          <div className={`w-[92vw] sm:w-[450px] h-[550px] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform scale-100 ${
            isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-neutral-250 text-neutral-800"
          }`}>
            {/* Header top row */}
            <div className="p-4 bg-neutral-900 dark:bg-zinc-950 text-white border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-neutral-800 text-neutral-200 flex items-center justify-center border border-neutral-700">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-tight">AI Resume Mentor</h3>
                  <div className="flex items-center gap-1 text-[8.5px] font-mono text-neutral-400">
                    <span className="w-1 h-1 rounded-full bg-neutral-400" />
                    <span>Always online</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setChatOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Conversation message items */}
            <div className={`flex-1 p-4 overflow-y-auto space-y-4 text-xs ${
              isDark ? "bg-slate-900/40" : "bg-slate-50"
            }`}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}>
                  {/* Sender Avatar */}
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                    msg.role === "user"
                      ? "bg-slate-100 border-slate-200 text-slate-700"
                      : "bg-sky-500/10 border-sky-500/20 text-sky-400"
                  }`}>
                    {msg.role === "user" ? <User size={13} /> : <Bot size={13} />}
                  </div>

                  <div className="space-y-2">
                    {/* Message Bubble text content */}
                    <div className={`p-3.5 rounded-2xl leading-relaxed ${
                      msg.role === "user"
                        ? "bg-sky-500 text-white font-medium rounded-tr-none"
                        : isDark
                          ? "bg-slate-950 border border-slate-850 rounded-tl-none text-slate-300"
                          : "bg-white border border-slate-205 rounded-tl-none shadow-xs text-slate-700"
                    }`}>
                      <div className="whitespace-pre-wrap font-sans text-xs">
                        {/* Render simple custom bullet formats or bold parsed text safely */}
                        {(() => {
                          let inCodeBlock = false;
                          return msg.text.split("\n").map((line, lIdx) => {
                            const trimmed = line.trim();
                            if (trimmed.includes("```")) {
                              inCodeBlock = !inCodeBlock;
                              return null;
                            }
                            if (inCodeBlock) {
                              return null;
                            }
                            // Parse simple markdown bold
                            const parts = [];
                            let lastIndex = 0;
                            const boldRegex = /\*\*(.*?)\*\*/g;
                            let match;
                            let processed = line;
                            while ((match = boldRegex.exec(processed)) !== null) {
                              if (match.index > lastIndex) {
                                parts.push(processed.substring(lastIndex, match.index));
                              }
                              parts.push(<strong key={match.index} className="font-extrabold text-sky-400">{match[1]}</strong>);
                              lastIndex = boldRegex.lastIndex;
                            }
                            if (lastIndex < processed.length) {
                              parts.push(processed.substring(lastIndex));
                            }
                            return (
                              <p key={lIdx} className={trimmed.startsWith("-") || trimmed.startsWith("*") ? "pl-2.5 mt-1" : "mt-1 md:mt-1.5"}>
                                {parts.length > 0 ? parts : processed}
                              </p>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    {/* SUGGESTED REWRITE CTA ACTION CARD */}
                    {msg.suggestedData && (
                      <div className={`p-3 rounded-2xl border flex flex-col gap-2 shadow-md ${
                        msg.applied 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                      }`}>
                        <div className="flex items-center gap-1.5 text-[10.5px] font-bold">
                          {msg.applied ? <CheckCircle size={13} className="text-emerald-400" /> : <Zap size={13} className="text-indigo-400 animate-pulse" />}
                          <span>{msg.applied ? "Successfully Merged to Profile!" : "Smart AI Suggested Updates:"}</span>
                        </div>
                        <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          {msg.applied 
                            ? "All revisions and text additions have been written into your resume state."
                            : "Click below to merge these professional revisions directly into your resume form."
                          }
                        </p>
                        
                        {!msg.applied && (
                          <button
                            onClick={() => handleApplySuggestion(idx, msg.suggestedData!)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-1.5 rounded-xl text-[10.5px] shadow-sm transition-all cursor-pointer active:scale-95 text-center mt-1"
                          >
                            ✨ Apply Suggestions in 1-Click
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loader indicator bubble */}
              {isTyping && (
                <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                  <div className="w-7 h-7 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-455 flex items-center justify-center animate-pulse">
                    <Bot size={13} />
                  </div>
                  <div className={`p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 ${
                    isDark ? "bg-slate-950 border border-slate-850 text-slate-500" : "bg-white border border-slate-205 text-slate-500"
                  }`}>
                    <RefreshCw size={11} className="animate-spin text-sky-400" />
                    <span>Gemini AI is crafting recommendations...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Drawer Gutter */}
            <div className={`px-3 py-2 border-t flex flex-col gap-1.5 ${
              isDark ? "bg-slate-950/40 border-slate-850" : "bg-slate-50 border-slate-205"
            }`}>
              <div className="text-[8.5px] font-mono font-bold tracking-wider text-slate-500 uppercase select-none text-left flex items-center gap-1">
                <Compass size={10} />
                <span>Quick Prompt Guide</span>
              </div>
              <div className="flex gap-1.5 flex-nowrap overflow-x-auto pb-1 scrollbar-thin">
                {quickPrompts.map((btn, bIdx) => (
                  <button
                    key={bIdx}
                    onClick={() => handleSendChat(undefined, btn.prompt)}
                    disabled={isTyping}
                    className={`shrink-0 px-2 py-1.5 text-[9.5px] font-bold border rounded-xl transition-all select-none cursor-pointer text-left ${
                      isDark 
                        ? "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white"
                        : "bg-white hover:bg-slate-100 border-slate-250 text-slate-700 hover:text-slate-950 shadow-xs"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form Footer */}
            <form onSubmit={handleSendChat} className={`p-3 border-t flex gap-2 ${
              isDark ? "bg-slate-950 border-slate-850" : "bg-white border-slate-255"
            }`}>
              <input
                type="text"
                disabled={isTyping}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask spark: Proofread project bullets..."
                className={`flex-1 text-xs px-3 py-2 border rounded-xl focus:outline-none ${
                  isDark
                    ? "bg-slate-900 border-slate-800 text-white focus:border-sky-505 placeholder:text-slate-505"
                    : "bg-slate-50 border-slate-250 text-slate-800 focus:border-sky-505 placeholder:text-slate-450 focus:bg-white"
                }`}
              />
              <button
                type="submit"
                disabled={isTyping || !chatMessage.trim()}
                className="p-2 rounded-xl bg-sky-500 text-white hover:bg-sky-450 active:scale-95 transition-all shadow-md shadow-sky-500/10 cursor-pointer disabled:opacity-50 flex items-center justify-center shrink-0 w-8.5"
              >
                <Send size={13} className="stroke-[2.5]" />
              </button>
            </form>
          </div>
        )}
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            {/* Close Button */}
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
            >
              <X size={18} />
            </button>
            
            <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg relative text-left ${
              isDark ? "bg-zinc-900 border-zinc-800" : "bg-white/95 backdrop-blur-md border-white/60 shadow-[0_10px_40px_rgba(99,102,241,0.04)]"
            }`}>
              <div className="text-center mb-6 relative">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-3 border ${
                  isDark ? "bg-zinc-950 text-neutral-300 border-zinc-800" : "bg-slate-50 text-indigo-655 border-slate-205 shadow-2xs"
                }`}>
                  <Lock size={18} className="stroke-[2.5]" />
                </div>
                <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>
                  {authMode === "login" ? "Account Sign In" : "Register Profile"}
                </h2>
                <p className={`text-xs mt-1 ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                  {authMode === "login" 
                    ? "Only authenticated users can enter the workspace" 
                    : "Create a secured, private sandbox profile"
                  }
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4 relative">
                {authError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-650 font-medium">
                    ⚠️ {authError}
                  </div>
                )}

                <div className="space-y-1 text-left">
                  <label className={`block text-[10px] font-mono tracking-wider font-bold uppercase ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                    Username
                  </label>
                  <input
                    type="text"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none placeholder:text-neutral-450 ${
                      isDark 
                        ? "bg-zinc-950 border-zinc-800 text-neutral-100 focus:border-zinc-700" 
                        : "bg-white border-slate-205 text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-2xs"
                    }`}
                    placeholder="e.g. khushi"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    required
                  />
                </div>

                {authMode === "register" && (
                  <div className="space-y-1 text-left">
                    <label className={`block text-[10px] font-mono tracking-wider font-bold uppercase ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none placeholder:text-neutral-455 ${
                        isDark 
                          ? "bg-zinc-950 border-zinc-800 text-neutral-100 focus:border-zinc-700" 
                          : "bg-white border-slate-205 text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-2xs"
                      }`}
                      placeholder="e.g. user@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-1 text-left">
                  <div className="flex justify-between items-center">
                    <label className={`block text-[10px] font-mono tracking-wider font-bold uppercase ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>
                      Password
                    </label>
                    {authMode === "login" && (
                      <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-400">
                        Try: <code className="font-bold">Khushi@123</code>
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none placeholder:text-neutral-400 ${
                      isDark 
                        ? "bg-zinc-950 border-zinc-800 text-neutral-100 focus:border-zinc-700" 
                        : "bg-white border-slate-205 text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-2xs"
                    }`}
                    placeholder={authMode === "login" ? "Enter secret code to access" : "Configure safe password"}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-550 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-950 font-bold text-xs py-3 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-lg cursor-pointer transition-all active:scale-98 mt-2"
                >
                  <span>{authMode === "login" ? "Authenticate & Enter Workspace" : "Register Profile & Login"}</span>
                  <ArrowRight size={14} className="stroke-[2.5]" />
                </button>
              </form>

              {/* Demo profile shortcuts */}
              <div className="mt-4 pt-3 border-t border-sky-500/10 flex flex-col gap-2">
                <span className={`text-[10px] font-mono tracking-wider font-bold uppercase ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
                  Demo Onboarding Profiles:
                </span>
                <button
                  onClick={() => handleDemoSignIn("khushi")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border font-bold text-[11px] transition-all cursor-pointer ${
                    isDark 
                      ? "border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400" 
                      : "border-indigo-200 bg-white hover:bg-indigo-50/50 text-indigo-650 hover:border-indigo-400"
                  }`}
                >
                  <UserCheck size={12} />
                  <span>Enter Workspace as Khushi</span>
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-sky-500/10 flex items-center justify-between text-xs">
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>
                  {authMode === "login" ? "Don't have an account yet?" : "Already registered?"}
                </span>
                <button
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "register" : "login");
                    setAuthError("");
                  }}
                  className="text-sky-405 font-extrabold hover:underline"
                >
                  {authMode === "login" ? "Create Custom Profile" : "Sign In to Existing"}
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
      </div>

      {/* ============================================================= */}
      {/* H. PRINT-ONLY VISUAL RESUME STYLES (HIDDEN EXCEPT WHEN PRINTING) */}
      {/* ============================================================= */}
      <div className="hidden print:block w-full">
        <LatexPrintView
          data={resumeData}
          fontSize={fontSize}
          lineHeight={lineHeight}
          margins={margins}
          sectionSpacing={sectionSpacing}
          fontTheme={fontTheme}
          showIcons={showIcons}
        />
      </div>
    </>
  );
}
