import React from "react";
import { ResumeData } from "../types";
import { Phone, Mail, Github, Linkedin, Code } from "lucide-react";

import { isValidLink } from "../utils";

export type ResumeLayout =
  | "classic"
  | "modern-left"
  | "blue-accent"
  | "compact"
  | "executive"
  | "minimal";

interface LatexPrintViewProps {
  data: ResumeData;
  fontSize: number; // in pt
  lineHeight: number; // multiplier
  margins: number; // in inches
  sectionSpacing: number; // in px
  fontTheme?: "classic-serif" | "modern-sans" | "editorial-lora";
  showIcons?: boolean;
  resumeLayout?: ResumeLayout;
}

export const LatexPrintView: React.FC<LatexPrintViewProps> = ({
  data,
  fontSize,
  lineHeight,
  margins,
  sectionSpacing,
  fontTheme = "classic-serif",
  showIcons = false,
  resumeLayout = "classic",
}) => {
  const { personalInfo, professionalSummary, education, skills, projects, certifications } = data;

  const fontClass = {
    "classic-serif": "font-serif",
    "modern-sans": "font-source",
    "editorial-lora": "font-lora",
  }[fontTheme] || "font-serif";

  const dynamicStyle = {
    fontSize: `${fontSize}pt`,
    lineHeight: lineHeight,
    paddingLeft: `${margins}in`,
    paddingRight: `${margins}in`,
    paddingTop: `${margins * 0.8}in`,
    paddingBottom: `${margins * 0.8}in`,
  };

  const isModernLeft = resumeLayout === "modern-left";
  const isBlueAccent = resumeLayout === "blue-accent";
  const isCompact = resumeLayout === "compact";
  const isExecutive = resumeLayout === "executive";
  const isMinimal = resumeLayout === "minimal";
  const effectiveSectionSpacing = isCompact ? Math.max(sectionSpacing * 0.55, 3) : isExecutive ? sectionSpacing * 1.15 : sectionSpacing;

  const headerAlignClass = isModernLeft || isExecutive ? "text-left" : "text-center";
  const headerBoxClass = isExecutive
    ? "border-b-2 border-neutral-900 pb-3 mb-4"
    : isBlueAccent
      ? "border-b-2 border-sky-600 pb-3 mb-4"
      : isModernLeft
        ? "border-l-4 border-sky-600 pl-4 pb-1 mb-4"
        : "mb-4";

  const nameColorClass = isBlueAccent || isModernLeft ? "text-sky-800" : "text-neutral-950";
  const sectionHeadingClass = isMinimal
    ? "text-[11pt] font-bold tracking-wide border-b border-neutral-300 pb-[1px] mb-2 text-neutral-900 text-left uppercase"
    : isBlueAccent || isModernLeft
      ? "text-[12pt] font-extrabold tracking-wide border-b-[1.5px] border-sky-600 pb-[1.5px] mb-2 text-sky-800 text-left uppercase"
      : "text-[12.5pt] font-bold tracking-wide border-b-[1.5px] border-neutral-800 pb-[1.5px] mb-2 text-neutral-950 text-left";

  const bulletClass = isBlueAccent || isModernLeft ? "bg-sky-700" : "bg-neutral-950";
  const projectGapClass = isCompact ? "gap-1.5" : "gap-3";

  const contactItems: React.ReactNode[] = [];
  
  if (isValidLink(personalInfo.phone, 'phone')) {
    contactItems.push(
      <span key="phone" className="flex items-center gap-1 text-neutral-900 font-medium">
        {showIcons && <Phone size={9} className="text-neutral-500 stroke-[2.5]" />}
        {personalInfo.phone}
      </span>
    );
  }

  if (isValidLink(personalInfo.email, 'email')) {
    contactItems.push(
      <a
        key="email"
        href={`mailto:${personalInfo.email}`}
        className="flex items-center gap-1 text-[#002fa7] hover:underline font-semibold"
      >
        {showIcons && <Mail size={9} className="text-neutral-500" />}
        {personalInfo.email}
      </a>
    );
  }

  if (isValidLink(personalInfo.github, 'github')) {
    contactItems.push(
      <a
        key="github"
        href={personalInfo.github}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 text-[#002fa7] hover:underline font-semibold"
      >
        {showIcons && <Github size={9} className="text-neutral-500" />}
        GitHub
      </a>
    );
  }

  if (isValidLink(personalInfo.linkedin, 'linkedin')) {
    contactItems.push(
      <a
        key="linkedin"
        href={personalInfo.linkedin}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 text-[#002fa7] hover:underline font-semibold"
      >
        {showIcons && <Linkedin size={9} className="text-neutral-500" />}
        LinkedIn
      </a>
    );
  }

  if (isValidLink(personalInfo.leetcode, 'leetcode')) {
    contactItems.push(
      <a
        key="leetcode"
        href={personalInfo.leetcode}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 text-[#002fa7] hover:underline font-semibold"
      >
        {showIcons && <Code size={9} className="text-neutral-500" />}
        LeetCode
      </a>
    );
  }

  return (
    <div
      id="latex-print-view"
      className={`print-container bg-white text-black ${fontClass} mx-auto w-[8.5in] min-h-[11in] shadow-2xl border border-slate-200 transition-all duration-300 relative select-text`}
      style={dynamicStyle}
    >
      {/* ---------- HEADING ---------- */}
      <div className={`${headerAlignClass} ${headerBoxClass}`}>
        {/* Scholar/Elite Centered Big Bold Name Title */}
        <h1 
          className={`${nameColorClass} ${headerAlignClass} tracking-tight leading-none ${
            fontTheme === "classic-serif" 
              ? `${isCompact ? "text-[19pt]" : "text-[22pt]"} font-serif font-bold`
              : fontTheme === "editorial-lora"
              ? `${isCompact ? "text-[18pt]" : "text-[20pt]"} font-lora font-bold`
              : `${isCompact ? "text-[18pt]" : "text-[19pt]"} font-source font-bold`
          }`}
        >
          {personalInfo.name}
        </h1>
        
        {/* Contact Strip matching the provided executive style exactly */}
        <div className={`flex flex-wrap ${isModernLeft || isExecutive ? "justify-start" : "justify-center"} items-center gap-x-2.5 gap-y-1 mt-2 text-[9.5pt] text-neutral-800 tracking-normal font-normal`}>
          {contactItems.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-neutral-300 select-none">|</span>}
              {item}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ----------- SUMMARY ----------- */}
      {professionalSummary && (
        <div style={{ marginBottom: `${effectiveSectionSpacing}px` }}>
          <h2 className={sectionHeadingClass}>
            Summary
          </h2>
          <p className="text-[9.5pt] text-justify text-neutral-900 font-normal">
            {professionalSummary}
          </p>
        </div>
      )}

      {/* ----------- EDUCATION ----------- */}
      {education && education.length > 0 && (
        <div style={{ marginBottom: `${effectiveSectionSpacing}px` }}>
          <h2 className={sectionHeadingClass}>
            Education
          </h2>
          <div className="flex flex-col gap-2">
            {education.map((edu) => (
              <div key={edu.id} className="text-[9.5pt]">
                <div className="flex justify-between items-baseline font-bold text-neutral-950">
                  <span className="text-[10pt]">{edu.institution}</span>
                  <span className="font-normal italic text-neutral-800 text-[9pt]">{edu.years}</span>
                </div>
                <div className="flex justify-between items-baseline text-neutral-900 italic text-[9.5pt] mt-0.5">
                  <span className="font-medium">{edu.degree}</span>
                  <span className="text-neutral-800 font-medium">{edu.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------- TECHNICAL SKILLS ----------- */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: `${effectiveSectionSpacing}px` }}>
          <h2 className={sectionHeadingClass}>
            Skills
          </h2>
          <div className="flex flex-col gap-1 text-[9.5pt] text-neutral-900">
            {skills.map((skillGroup) => (
              <div key={skillGroup.id}>
                <span className="font-bold text-neutral-950">{skillGroup.category}: </span>
                <span className="font-normal">{skillGroup.skills.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------- PROJECTS ----------- */}
      {projects && projects.length > 0 && (
        <div style={{ marginBottom: `${effectiveSectionSpacing}px` }}>
          <h2 className={sectionHeadingClass}>
            Projects
          </h2>
          <div className={`flex flex-col ${projectGapClass}`}>
            {projects.map((proj) => (
              <div key={proj.id} className="text-[9.5pt]">
                {/* Project Title and Date */}
                <div className="flex justify-between items-baseline font-bold text-neutral-950">
                  <span className="text-[10pt]">{proj.title}</span>
                  <span className="font-normal italic text-neutral-800 text-[9pt]">{proj.year}</span>
                </div>
                
                {/* PDF Repository / Website Links Styled Cleanly */}
                {(proj.githubUrl || proj.liveUrl) && (
                  <div className="text-[9pt] mt-0.5 mb-1 flex gap-3 text-neutral-800 select-text">
                    {proj.githubUrl && (
                      <span className="italic font-normal">
                        GitHub:{" "}
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#002fa7] hover:underline font-semibold not-italic"
                        >
                          Repository
                        </a>
                      </span>
                    )}
                    {proj.liveUrl && (
                      <span className="italic font-normal">
                        Live website:{" "}
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#002fa7] hover:underline font-semibold not-italic"
                        >
                          Website
                        </a>
                      </span>
                    )}
                  </div>
                )} {proj.techStack && proj.techStack.length > 0 && !proj.githubUrl && !proj.liveUrl && (
                  <div className="text-[9pt] text-neutral-700 italic mt-0.5 mb-1">
                    <span className="font-semibold not-italic">Tech Stack: </span>
                    {proj.techStack.join(", ")}
                  </div>
                )}
 
                {/* Elegant Bullet points with sharp custom dots */}
                <ul className="flex flex-col gap-1 pl-1 text-[9.5pt] text-neutral-900 mt-1">
                  {proj.bullets.map((bullet, idx) => (
                    <li key={idx} className="relative pl-3.5 text-justify font-normal">
                      {/* True black circular dot */}
                      <span className={`absolute left-[3px] top-[0.45em] w-1 h-1 rounded-full ${bulletClass} select-none`} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------- CERTIFICATIONS ----------- */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: `${effectiveSectionSpacing}px` }}>
          <h2 className={sectionHeadingClass}>
            Certifications & Achievements
          </h2>
          <div className="flex flex-col gap-2.5">
            {certifications.map((cert) => (
              <div key={cert.id} className="text-[9.5pt]">
                <div className="flex justify-between items-baseline font-bold text-neutral-950">
                  <span className="text-[10pt]">{cert.title} {cert.issuer ? `-- ${cert.issuer}` : ""}</span>
                  <span className="font-normal italic text-neutral-800 text-[9pt]">{cert.year}</span>
                </div>
                
                {/* URLs Line for credentials */}
                {(cert.certificateUrl || cert.badgeUrl) && (
                  <div className="text-[9pt] mt-0.5 mb-1 flex gap-3 text-[#002fa7]">
                    {cert.certificateUrl && (
                      <a
                        href={cert.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline font-semibold"
                      >
                        View Certificate
                      </a>
                    )}
                    {cert.badgeUrl && (
                      <a
                        href={cert.badgeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline font-semibold"
                      >
                        View Badge
                      </a>
                    )}
                  </div>
                )}

                <ul className="flex flex-col gap-1 pl-1 text-[9.5pt] text-neutral-900 mt-1">
                  {cert.bullets.map((bullet, idx) => (
                    <li key={idx} className="relative pl-3.5 text-justify font-normal">
                      <span className={`absolute left-[3px] top-[0.45em] w-1 h-1 rounded-full ${bulletClass} select-none`} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Page Cut-off Guideline (Only on screen, hidden on print) */}
      <div className="absolute left-0 right-0 top-[11in] border-t-2 border-dashed border-rose-400/60 pointer-events-none print:hidden flex items-center justify-end z-10">
        <span className="bg-rose-500 text-white text-[8.5px] font-mono tracking-wider px-2 py-0.5 rounded-l shadow-sm -mt-3.5 backdrop-blur-xs select-none">
          PAGE 1 BOUNDARY (11" PRINT LIMIT)
        </span>
      </div>

    </div>
  );
};
