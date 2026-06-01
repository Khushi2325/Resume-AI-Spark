import React, { useState, useEffect } from "react";
import { ResumeData, EducationEntry, ExperienceEntry, SkillGroup, ProjectEntry, CertificationEntry } from "../types";

interface CommaSeparatedInputFieldProps {
  initialValue: string[];
  onChange: (items: string[]) => void;
  className?: string;
  placeholder?: string;
}

const CommaSeparatedInputField: React.FC<CommaSeparatedInputFieldProps> = ({
  initialValue,
  onChange,
  className = "",
  placeholder = "",
}) => {
  const [val, setVal] = useState(() => initialValue.join(", "));

  useEffect(() => {
    const parsedCurrentLocal = val.split(",").map((s) => s.trim()).filter(Boolean);
    const isMatching = JSON.stringify(parsedCurrentLocal) === JSON.stringify(initialValue);
    if (!isMatching) {
      setVal(initialValue.join(", "));
    }
  }, [JSON.stringify(initialValue)]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputStr = e.target.value;
    setVal(inputStr);

    const parsed = inputStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    onChange(parsed);
  };

  return (
    <input
      type="text"
      value={val}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
    />
  );
};
import {
  User,
  GraduationCap,
  Wrench,
  Layers,
  Award,
  Briefcase,
  RefreshCw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Link2,
} from "lucide-react";

interface ResumeDataEditorProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  onReset: () => void;
  themeMode?: "dark" | "light";
}

export const ResumeDataEditor: React.FC<ResumeDataEditorProps> = ({
  data,
  onChange,
  onReset,
  themeMode = "dark",
}) => {
  const [activeTab, setActiveTab] = useState<string>("personal");

  const isDark = themeMode === "dark";

  const wrapperClass = isDark 
    ? "bg-zinc-900 border border-zinc-805 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden select-none"
    : "bg-white/95 backdrop-blur-xl border-2 border-blue-50 rounded-3xl shadow-[0_10px_40px_rgba(59,130,246,0.08)] flex flex-col h-full overflow-hidden select-none text-slate-800";

  const tabHeaderClass = isDark
    ? "border-b border-zinc-800 bg-zinc-950 p-2.5 flex flex-wrap gap-1.5 scrollbar-thin overflow-x-auto no-print"
    : "border-b-2 border-blue-50 bg-blue-50/40 p-3 flex flex-wrap gap-2 overflow-x-auto no-print";

  const tabBtnInactiveClass = isDark
    ? "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
    : "bg-white hover:bg-blue-50 border border-blue-100 text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-sm font-bold transition-all duration-200";

  const resetBtnClass = isDark
    ? "ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-950/40 hover:text-red-300 border border-red-900/20 transition-all font-sans"
    : "ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-55 hover:text-rose-705 border border-rose-100 hover:border-rose-200 shadow-2xs transition-all duration-200 font-sans cursor-pointer";

  const contentAreaClass = isDark
    ? "p-5 flex-1 overflow-y-auto text-zinc-300 select-text"
    : "p-6 flex-1 overflow-y-auto text-slate-800 select-text";

  const sectionHeadingClass = isDark
    ? "text-sm font-bold text-zinc-400 tracking-wider uppercase mb-2 flex items-center gap-1.5 font-mono"
    : "text-sm font-black text-blue-900 tracking-wider uppercase mb-2 flex items-center gap-1.5 font-mono";

  const labelTextClass = isDark
    ? "block text-xs font-semibold text-zinc-400 mb-1"
    : "block text-xs font-bold text-blue-800/70 mb-1";

  const inputElemClass = isDark
    ? "w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-750 placeholder:text-zinc-650"
    : "w-full bg-white border-2 border-blue-50 hover:border-blue-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-400 shadow-sm transition-all duration-200";

  const textareaClass = isDark
    ? "w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-zinc-750 leading-relaxed font-sans"
    : "w-full bg-white border-2 border-blue-50 hover:border-blue-200 rounded-xl p-3.5 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 leading-relaxed font-sans shadow-sm transition-all duration-200";

  const recordCardClass = isDark
    ? "p-4 bg-zinc-950 rounded-xl border border-zinc-805 space-y-3 relative group"
    : "p-5 bg-white rounded-2xl border-2 border-blue-50 space-y-4 relative group shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200";

  const recordCardProjClass = isDark
    ? "p-4 bg-zinc-950 rounded-xl border border-zinc-805 space-y-4 relative"
    : "p-5 bg-white rounded-2xl border-2 border-blue-50 space-y-4 relative shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200";

  const inputNestedClass = isDark
    ? "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-750"
    : "w-full bg-white border-2 border-blue-50 hover:border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all duration-200";

  const labelNestedClass = isDark
    ? "block text-[11px] font-semibold text-zinc-500 mb-0.5 font-sans"
    : "block text-[11px] font-bold text-blue-800/70 mb-0.5 font-sans";

  // Helper to deep clone and trigger onChange
  const updateData = (updater: (draft: ResumeData) => void) => {
    const clone = JSON.parse(JSON.stringify(data)) as ResumeData;
    updater(clone);
    onChange(clone);
  };

  const handlePersonalChange = (field: keyof typeof data.personalInfo, value: string) => {
    updateData((draft) => {
      draft.personalInfo[field] = value;
    });
  };

  const setSummary = (value: string) => {
    updateData((draft) => {
      draft.professionalSummary = value;
    });
  };

  // Education Helpers
  const handleEduChange = (id: string, field: keyof EducationEntry, value: string) => {
    updateData((draft) => {
      const idx = draft.education.findIndex((item) => item.id === id);
      if (idx !== -1) {
        draft.education[idx][field] = value;
      }
    });
  };

  const addEdu = () => {
    updateData((draft) => {
      draft.education.push({
        id: `edu-${Date.now()}`,
        institution: "New University / School",
        years: "Dates (e.g. 2025 -- Present)",
        degree: "Major / Course Of Study",
        location: "City, Country",
      });
    });
  };

  const removeEdu = (id: string) => {
    updateData((draft) => {
      draft.education = draft.education.filter((item) => item.id !== id);
    });
  };

  // Experience Helpers
  const handleExpChange = (id: string, field: keyof ExperienceEntry, value: string) => {
    updateData((draft) => {
      const idx = draft.experience.findIndex((item) => item.id === id);
      if (idx !== -1) {
        (draft.experience[idx] as any)[field] = value;
      }
    });
  };

  const handleExpBulletChange = (expId: string, bIdx: number, val: string) => {
    updateData((draft) => {
      const eIdx = draft.experience.findIndex((e) => e.id === expId);
      if (eIdx !== -1) {
        draft.experience[eIdx].bullets[bIdx] = val;
      }
    });
  };

  const addExpBullet = (expId: string) => {
    updateData((draft) => {
      const eIdx = draft.experience.findIndex((e) => e.id === expId);
      if (eIdx !== -1) {
        draft.experience[eIdx].bullets.push("New impact-focused bullet point.");
      }
    });
  };

  const removeExpBullet = (expId: string, bIdx: number) => {
    updateData((draft) => {
      const eIdx = draft.experience.findIndex((e) => e.id === expId);
      if (eIdx !== -1) {
        draft.experience[eIdx].bullets.splice(bIdx, 1);
      }
    });
  };

  const addExp = () => {
    updateData((draft) => {
      draft.experience.push({
        id: `exp-${Date.now()}`,
        company: "Company Name",
        role: "Job Title",
        duration: "Start Date - End Date",
        location: "City, Country",
        bullets: ["Describe your impact and achievements here."],
      });
    });
  };

  const removeExp = (id: string) => {
    updateData((draft) => {
      draft.experience = draft.experience.filter((item) => item.id !== id);
    });
  };

  // Skills Helpers
  const handleSkillGroupCategory = (id: string, cat: string) => {
    updateData((draft) => {
      const idx = draft.skills.findIndex((s) => s.id === id);
      if (idx !== -1) draft.skills[idx].category = cat;
    });
  };

  const handleSkillList = (id: string, skills: string[]) => {
    updateData((draft) => {
      const idx = draft.skills.findIndex((s) => s.id === id);
      if (idx !== -1) {
        draft.skills[idx].skills = skills;
      }
    });
  };

  const addSkillGroup = () => {
    updateData((draft) => {
      draft.skills.push({
        id: `skill-${Date.now()}`,
        category: "Skill Group Title",
        skills: ["Skill A", "Skill B"],
      });
    });
  };

  const removeSkillGroup = (id: string) => {
    updateData((draft) => {
      draft.skills = draft.skills.filter((s) => s.id !== id);
    });
  };

  // Projects Helpers
  const handleProjChange = (id: string, field: keyof ProjectEntry, value: any) => {
    updateData((draft) => {
      const idx = draft.projects.findIndex((p) => p.id === id);
      if (idx !== -1) {
        (draft.projects[idx] as any)[field] = value;
      }
    });
  };

  const handleProjTechStack = (id: string, tech: string[]) => {
    updateData((draft) => {
      const idx = draft.projects.findIndex((p) => p.id === id);
      if (idx !== -1) {
        draft.projects[idx].techStack = tech;
      }
    });
  };

  const handleProjBulletChange = (projId: string, bIdx: number, val: string) => {
    updateData((draft) => {
      const pIdx = draft.projects.findIndex((p) => p.id === projId);
      if (pIdx !== -1) {
        draft.projects[pIdx].bullets[bIdx] = val;
      }
    });
  };

  const addProjBullet = (projId: string) => {
    updateData((draft) => {
      const pIdx = draft.projects.findIndex((p) => p.id === projId);
      if (pIdx !== -1) {
        draft.projects[pIdx].bullets.push("New impact-focused bullet point.");
      }
    });
  };

  const removeProjBullet = (projId: string, bIdx: number) => {
    updateData((draft) => {
      const pIdx = draft.projects.findIndex((p) => p.id === projId);
      if (pIdx !== -1) {
        draft.projects[pIdx].bullets = draft.projects[pIdx].bullets.filter((_, i) => i !== bIdx);
      }
    });
  };

  const addProject = () => {
    updateData((draft) => {
      draft.projects.push({
        id: `proj-${Date.now()}`,
        title: "New Project Name",
        year: "2025",
        techStack: ["React", "Express"],
        bullets: ["Developed a key achievement with measurable outcomes.", "Created clean UI flows."],
      });
    });
  };

  const removeProject = (id: string) => {
    updateData((draft) => {
      draft.projects = draft.projects.filter((p) => p.id !== id);
    });
  };

  // Certifications Helpers
  const handleCertChange = (id: string, field: keyof CertificationEntry, value: any) => {
    updateData((draft) => {
      const idx = draft.certifications.findIndex((c) => c.id === id);
      if (idx !== -1) {
        (draft.certifications[idx] as any)[field] = value;
      }
    });
  };

  const handleCertBulletChange = (certId: string, bIdx: number, val: string) => {
    updateData((draft) => {
      const cIdx = draft.certifications.findIndex((c) => c.id === certId);
      if (cIdx !== -1) {
        draft.certifications[cIdx].bullets[bIdx] = val;
      }
    });
  };

  const addCertBullet = (certId: string) => {
    updateData((draft) => {
      const cIdx = draft.certifications.findIndex((c) => c.id === certId);
      if (cIdx !== -1) {
        draft.certifications[cIdx].bullets.push("New certification highlight / impact statement.");
      }
    });
  };

  const removeCertBullet = (certId: string, bIdx: number) => {
    updateData((draft) => {
      const cIdx = draft.certifications.findIndex((c) => c.id === certId);
      if (cIdx !== -1) {
        draft.certifications[cIdx].bullets = draft.certifications[cIdx].bullets.filter((_, i) => i !== bIdx);
      }
    });
  };

  const addCert = () => {
    updateData((draft) => {
      draft.certifications.push({
        id: `cert-${Date.now()}`,
        title: "Certified Professional Practitioner",
        issuer: "Issuing Org",
        year: "2025",
        bullets: ["Obtained system administration and operational efficiency credentials."],
      });
    });
  };

  const removeCert = (id: string) => {
    updateData((draft) => {
      draft.certifications = draft.certifications.filter((c) => c.id !== id);
    });
  };

  // Tab definitions
  const tabs = [
    { id: "personal", label: "Contact Info", icon: User },
    { id: "summary", label: "Professional Summary", icon: FileText },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Wrench },
    { id: "projects", label: "Projects", icon: Layers },
    { id: "certifications", label: "Achievements", icon: Award },
  ];

  return (
    <div className={wrapperClass}>
      {/* Tab bar header */}
      <div className={tabHeaderClass}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all cursor-pointer ${
                isActive
                  ? (isDark ? "bg-white text-zinc-950 shadow-xs border border-white" : "bg-blue-600 text-white border border-blue-600 shadow-md shadow-blue-600/10")
                  : tabBtnInactiveClass
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
        <button
          onClick={onReset}
          className={resetBtnClass}
          title="Reset to Template Default"
        >
          <RefreshCw size={13} />
          Reset Defaults
        </button>
      </div>

      {/* Editor Content Area */}
      <div className={contentAreaClass}>
        {/* PERSONAL VIEW */}
        {activeTab === "personal" && (
          <div className="space-y-4">
            <h3 className={sectionHeadingClass}>
              <User size={15} /> Personal Contact Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelTextClass}>Full Name</label>
                <input
                  type="text"
                  value={data.personalInfo.name}
                  onChange={(e) => handlePersonalChange("name", e.target.value)}
                  className={inputElemClass}
                />
              </div>
              <div>
                <label className={labelTextClass}>Phone Number</label>
                <input
                  type="text"
                  value={data.personalInfo.phone}
                  onChange={(e) => handlePersonalChange("phone", e.target.value)}
                  className={inputElemClass}
                />
              </div>
              <div>
                <label className={labelTextClass}>Email Address</label>
                <input
                  type="email"
                  value={data.personalInfo.email}
                  onChange={(e) => handlePersonalChange("email", e.target.value)}
                  className={inputElemClass}
                />
              </div>
              <div>
                <label className={labelTextClass}>GitHub Address</label>
                <input
                  type="url"
                  value={data.personalInfo.github}
                  onChange={(e) => handlePersonalChange("github", e.target.value)}
                  className={inputElemClass}
                />
              </div>
              <div>
                <label className={labelTextClass}>LinkedIn Profile</label>
                <input
                  type="url"
                  value={data.personalInfo.linkedin}
                  onChange={(e) => handlePersonalChange("linkedin", e.target.value)}
                  className={inputElemClass}
                />
              </div>
              <div>
                <label className={labelTextClass}>LeetCode Handle / Webpage</label>
                <input
                  type="url"
                  value={data.personalInfo.leetcode}
                  onChange={(e) => handlePersonalChange("leetcode", e.target.value)}
                  className={inputElemClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY VIEW */}
        {activeTab === "summary" && (
          <div className="space-y-4">
            <h3 className={sectionHeadingClass}>
              <FileText size={15} /> Professional Summary
            </h3>
            <div>
              <label className="block text-xs font-semibold mb-1.5">
                Executive Overview (Be concise. Aim for 3-5 sentences maximum to stay single-page)
              </label>
              <textarea
                value={data.professionalSummary}
                onChange={(e) => setSummary(e.target.value)}
                rows={7}
                className={textareaClass}
              />
              <p className="text-xs text-slate-500 mt-1">
                Tip: Standard ATS-friendly formats favor action-oriented summaries focusing heavily on core technologies (Node, Java, systems).
              </p>
            </div>
          </div>
        )}

        {/* EXPERIENCE VIEW */}
        {activeTab === "experience" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className={sectionHeadingClass}>
                <Briefcase size={15} /> Work Experience
              </h3>
              <button
                onClick={addExp}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-md shadow-blue-600/10 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <Plus size={13} />
                Add Role
              </button>
            </div>

            <div className="space-y-4">
              {data.experience?.map((exp, index) => (
                <div key={exp.id} className={recordCardProjClass}>
                  <button
                    onClick={() => removeExp(exp.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                    title="Delete Role"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="text-xs font-bold text-sky-450 mb-2">
                    Role #{index + 1}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelNestedClass}>Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExpChange(exp.id, "company", e.target.value)}
                        className={inputNestedClass}
                        placeholder="e.g. Google"
                      />
                    </div>
                    <div>
                      <label className={labelNestedClass}>Job Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleExpChange(exp.id, "role", e.target.value)}
                        className={inputNestedClass}
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                    <div>
                      <label className={labelNestedClass}>Duration</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => handleExpChange(exp.id, "duration", e.target.value)}
                        className={inputNestedClass}
                        placeholder="e.g. Jun 2021 - Present"
                      />
                    </div>
                    <div>
                      <label className={labelNestedClass}>Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => handleExpChange(exp.id, "location", e.target.value)}
                        className={inputNestedClass}
                        placeholder="e.g. Mountain View, CA"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className={labelNestedClass}>Key Achievements & Responsibilities</label>
                    <div className="space-y-2 mt-2">
                      {exp.bullets.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2">
                          <textarea
                            rows={2}
                            value={b}
                            onChange={(e) => handleExpBulletChange(exp.id, bIdx, e.target.value)}
                            className={inputNestedClass}
                            style={{ resize: "vertical" }}
                          />
                          <button
                            onClick={() => removeExpBullet(exp.id, bIdx)}
                            className="text-slate-400 hover:text-rose-400 mt-2 transition-colors cursor-pointer"
                            title="Remove bullet"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addExpBullet(exp.id)}
                        className="text-xs font-bold text-sky-500 hover:text-sky-400 flex items-center gap-1 mt-1 transition-colors cursor-pointer"
                      >
                        <Plus size={11} />
                        Add Bullet Point
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {(!data.experience || data.experience.length === 0) && (
                <div className="text-center py-6 text-xs text-slate-500">
                  No work experience added yet. Click "Add Role" to get started!
                </div>
              )}
            </div>
          </div>
        )}

        {/* EDUCATION VIEW */}
        {activeTab === "education" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className={sectionHeadingClass}>
                <GraduationCap size={15} /> Educational Records
              </h3>
              <button
                onClick={addEdu}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-md shadow-blue-600/10 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <Plus size={13} />
                Add Record
              </button>
            </div>

            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={edu.id} className={recordCardClass}>
                  <button
                    onClick={() => removeEdu(edu.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="text-xs font-bold text-sky-450">
                    Record #{index + 1}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className={labelNestedClass}>Institution Name</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEduChange(edu.id, "institution", e.target.value)}
                        className={inputNestedClass}
                        placeholder="e.g. Parul University"
                      />
                    </div>
                    <div>
                      <label className={labelNestedClass}>Timeline (Years)</label>
                      <input
                        type="text"
                        value={edu.years}
                        onChange={(e) => handleEduChange(edu.id, "years", e.target.value)}
                        className={inputNestedClass}
                        placeholder="e.g. 2023 -- Present"
                      />
                    </div>
                    <div>
                      <label className={labelNestedClass}>Degree & Grades</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEduChange(edu.id, "degree", e.target.value)}
                        className={inputNestedClass}
                        placeholder="B.Tech Computer Science | CGPA: 8.74/10"
                      />
                    </div>
                    <div>
                      <label className={labelNestedClass}>Location</label>
                      <input
                        type="text"
                        value={edu.location}
                        onChange={(e) => handleEduChange(edu.id, "location", e.target.value)}
                        className={inputNestedClass}
                        placeholder="Vadodara, Gujarat"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {data.education.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500">
                  No educational experiences declared. Click &apos;Add Record&apos; to create one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* SKILLS VIEW */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className={sectionHeadingClass}>
                <Wrench size={15} /> Skill Categories
              </h3>
              <button
                onClick={addSkillGroup}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-md shadow-blue-600/10 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <Plus size={13} />
                Add Category
              </button>
            </div>

            <div className="space-y-3">
              {data.skills.map((skillGroup, index) => (
                <div key={skillGroup.id} className={recordCardClass}>
                  <button
                    onClick={() => removeSkillGroup(skillGroup.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-all font-bold cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="text-xs font-bold text-sky-400">
                    Group #{index + 1}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <label className={labelNestedClass}>Category Title</label>
                      <input
                        type="text"
                        value={skillGroup.category}
                        onChange={(e) => handleSkillGroupCategory(skillGroup.id, e.target.value)}
                        className={inputNestedClass}
                        placeholder="Languages"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelNestedClass}>Skills (Comma-separated)</label>
                      <CommaSeparatedInputField
                        initialValue={skillGroup.skills}
                        onChange={(parsed) => handleSkillList(skillGroup.id, parsed)}
                        className={inputNestedClass}
                        placeholder="Java, React, SQL"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS VIEW */}
        {activeTab === "projects" && (
          <div className="space-y-5">
            <div className="flex justify-between items-center mb-2">
              <h3 className={sectionHeadingClass}>
                <Layers size={15} /> Substantial Projects
              </h3>
              <button
                onClick={addProject}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-md shadow-blue-600/10 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <Plus size={13} />
                Add Project
              </button>
            </div>

            <div className="space-y-4">
              {data.projects.map((proj, pIdx) => (
                <div key={proj.id} className={recordCardProjClass}>
                  <button
                    onClick={() => removeProject(proj.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-all font-bold cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="text-xs font-bold text-sky-450">
                    Project #{pIdx + 1}: {proj.title}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className={labelNestedClass}>Project Title</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => handleProjChange(proj.id, "title", e.target.value)}
                        className={inputNestedClass}
                      />
                    </div>
                    <div>
                      <label className={labelNestedClass}>Timeline (Year)</label>
                      <input
                        type="text"
                        value={proj.year}
                        onChange={(e) => handleProjChange(proj.id, "year", e.target.value)}
                        className={inputNestedClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelNestedClass}>Tech Stack (comma-separated)</label>
                    <CommaSeparatedInputField
                      initialValue={proj.techStack}
                      onChange={(parsed) => handleProjTechStack(proj.id, parsed)}
                      className={inputNestedClass}
                      placeholder="React, TypeScript, Tailwind"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelNestedClass}>GitHub URL (Optional)</label>
                      <input
                        type="text"
                        value={proj.githubUrl || ""}
                        onChange={(e) => handleProjChange(proj.id, "githubUrl", e.target.value)}
                        className={inputNestedClass}
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div>
                      <label className={labelNestedClass}>Live/Demo URL (Optional)</label>
                      <input
                        type="text"
                        value={proj.liveUrl || ""}
                        onChange={(e) => handleProjChange(proj.id, "liveUrl", e.target.value)}
                        className={inputNestedClass}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Bullet description statements */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-semibold text-slate-400">Accomplishments (ATS Bullets)</label>
                      <button
                        onClick={() => addProjBullet(proj.id)}
                        className="text-[10px] text-blue-600 hover:text-blue-850 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                      >
                        <Plus size={10} /> Add Bullet
                      </button>
                    </div>

                    <div className="space-y-2">
                      {proj.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex gap-2 items-center">
                          <span className="text-[10px] text-slate-500 font-mono">{bIdx + 1}.</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => handleProjBulletChange(proj.id, bIdx, e.target.value)}
                            className={inputNestedClass}
                          />
                          <button
                            onClick={() => removeProjBullet(proj.id, bIdx)}
                            className="text-slate-500 hover:text-rose-400 cursor-pointer"
                            title="Remove Bullet"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CERTIFICATIONS & ACHIEVEMENTS VIEW */}
        {activeTab === "certifications" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className={sectionHeadingClass}>
                <Award size={15} /> Certifications & Honors
              </h3>
              <button
                onClick={addCert}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-md shadow-blue-600/10 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <Plus size={13} />
                Add Record
              </button>
            </div>

            <div className="space-y-4">
              {data.certifications.map((cert, cIdx) => (
                <div key={cert.id} className={recordCardProjClass}>
                  <button
                    onClick={() => removeCert(cert.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-all font-bold cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="text-xs font-bold text-sky-450">
                    Item #{cIdx + 1}: {cert.title}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className={labelNestedClass}>Credential / Title</label>
                      <input
                        type="text"
                        value={cert.title}
                        onChange={(e) => handleCertChange(cert.id, "title", e.target.value)}
                        className={inputNestedClass}
                      />
                    </div>
                    <div>
                      <label className={labelNestedClass}>Timeline (Year)</label>
                      <input
                        type="text"
                        value={cert.year}
                        onChange={(e) => handleCertChange(cert.id, "year", e.target.value)}
                        className={inputNestedClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className={labelNestedClass}>Issuer / Context</label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => handleCertChange(cert.id, "issuer", e.target.value)}
                        className={inputNestedClass}
                        placeholder="ServiceNow"
                      />
                    </div>
                    <div>
                      <label className={labelNestedClass}>Certificate Link</label>
                      <input
                        type="text"
                        value={cert.certificateUrl || ""}
                        onChange={(e) => handleCertChange(cert.id, "certificateUrl", e.target.value)}
                        className={inputNestedClass}
                        placeholder="HTTPS URL Link"
                      />
                    </div>
                    <div>
                      <label className={labelNestedClass}>Badge Link (Optional)</label>
                      <input
                        type="text"
                        value={cert.badgeUrl || ""}
                        onChange={(e) => handleCertChange(cert.id, "badgeUrl", e.target.value)}
                        className={inputNestedClass}
                        placeholder="HTTPS Image/Credly Link"
                      />
                    </div>
                  </div>

                  {/* Bullet description statements */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-semibold text-slate-400">Supporting Details</label>
                      <button
                        onClick={() => addCertBullet(cert.id)}
                        className="text-[10px] text-blue-600 hover:text-blue-850 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                      >
                        <Plus size={10} /> Add Detail
                      </button>
                    </div>

                    <div className="space-y-2">
                      {cert.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex gap-2 items-center">
                          <span className="text-[10px] text-slate-500 font-mono">{bIdx + 1}.</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => handleCertBulletChange(cert.id, bIdx, e.target.value)}
                            className={inputNestedClass}
                          />
                          <button
                            onClick={() => removeCertBullet(cert.id, bIdx)}
                            className="text-slate-500 hover:text-rose-400 cursor-pointer"
                            title="Remove Detail"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
