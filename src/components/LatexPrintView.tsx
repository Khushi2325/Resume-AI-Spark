import React from "react";
import { ResumeData } from "../types";
import { Phone, Mail, Github, Linkedin, Code, MapPin, ExternalLink } from "lucide-react";
import { isValidLink, extractUsername } from "../utils";

export type ResumeLayout =
  | "classic"        // 1. Classic Scholar — centered name, colored section underlines
  | "two-column"     // 2. Two-Column Pro — left sidebar + right main content
  | "bold-banner"    // 3. Bold Banner — full-width colored header band
  | "tabular"        // 4. Academic Tabular — table-based edu, small-caps headings
  | "cv-academic"    // 5. CV Academic — contact right, date-left format entries
  | "minimal";       // 6. Minimal Ink — pure typographic hierarchy, no borders

interface LatexPrintViewProps {
  data: ResumeData;
  fontSize: number;
  lineHeight: number;
  margins: number;
  sectionSpacing: number;
  fontTheme?: "classic-serif" | "modern-sans" | "editorial-lora";
  showIcons?: boolean;
  resumeLayout?: ResumeLayout;
}

/* ─────────────────────────── shared helpers ─────────────────────────── */

const fontClass = (theme: string) =>
  ({ "classic-serif": "font-serif", "modern-sans": "font-source", "editorial-lora": "font-lora" }[theme] ?? "font-serif");

function ContactLine({ data, showIcons, separator = " | ", className = "" }: {
  data: ResumeData["personalInfo"];
  showIcons?: boolean;
  separator?: string;
  className?: string;
}) {
  const items: React.ReactNode[] = [];
  if (isValidLink(data.phone, "phone"))
    items.push(<span key="ph" className="flex items-center gap-0.5">{showIcons && <Phone size={8} />}{data.phone}</span>);
  if (isValidLink(data.email, "email"))
    items.push(<a key="em" href={`mailto:${data.email}`} className="flex items-center gap-0.5 text-[#002fa7] hover:underline">{showIcons && <Mail size={8} />}{data.email}</a>);
  if (isValidLink(data.github, "github"))
    items.push(<a key="gh" href={data.github} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-[#002fa7] hover:underline">{showIcons && <Github size={8} />}{extractUsername(data.github, "github") ?? "GitHub"}</a>);
  if (isValidLink(data.linkedin, "linkedin"))
    items.push(<a key="li" href={data.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-[#002fa7] hover:underline">{showIcons && <Linkedin size={8} />}{extractUsername(data.linkedin, "linkedin") ?? "LinkedIn"}</a>);
  if (isValidLink(data.leetcode, "leetcode"))
    items.push(<a key="lc" href={data.leetcode} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-[#002fa7] hover:underline">{showIcons && <Code size={8} />}{extractUsername(data.leetcode, "leetcode") ?? "LeetCode"}</a>);

  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 ${className}`}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-neutral-300 select-none">{separator}</span>}
          {item}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LAYOUT 1 — CLASSIC SCHOLAR
   Single column, name centered, all black — only hyperlinks blue.
   Matches original LaTeX-style academic resume exactly.
══════════════════════════════════════════════════════════════════ */
function ClassicScholar({ data, fs, lh, mar, sp, font, icons }: any) {
  const { personalInfo: pi, professionalSummary, experience, education, skills, projects, certifications } = data;
  /* Section heading: pure black, dark underline rule — no color accent */
  const sec = (title: string) => (
    <h2 style={{ fontSize: `${fs + 1.5}pt`, borderBottom: "1.5px solid #111827", color: "#111827", paddingBottom: "1.5px", marginBottom: `${sp * 0.55}px`, fontWeight: 700, letterSpacing: "0.025em", fontFamily: "inherit" }}>
      {title}
    </h2>
  );
  return (
    <div style={{ fontSize: `${fs}pt`, lineHeight: lh, padding: `${mar * 0.8}in ${mar}in`, fontFamily: "inherit" }}>

      {/* ── HEADER: Centered name + contact strip ── */}
      <div style={{ textAlign: "center", marginBottom: `${sp}px` }}>
        <h1 style={{ fontSize: `${fs + 12}pt`, fontWeight: 700, color: "#0d1117", letterSpacing: "-0.01em", lineHeight: 1.1, margin: 0, fontFamily: "inherit" }}>
          {pi.name}
        </h1>
        <ContactLine data={pi} showIcons={icons} separator="|" className="justify-center mt-1.5" />
      </div>

      {/* ── SUMMARY ── */}
      {professionalSummary && (
        <div style={{ marginBottom: `${sp}px` }}>
          {sec("Summary")}
          <p style={{ color: "#1c1c1c", textAlign: "justify", margin: 0, fontSize: `${fs - 0.5}pt` }}>{professionalSummary}</p>
        </div>
      )}

      {/* ── EXPERIENCE ── */}
      {experience?.length > 0 && (
        <div style={{ marginBottom: `${sp}px` }}>
          {sec("Experience")}
          <div style={{ display: "flex", flexDirection: "column", gap: `${sp * 0.65}px` }}>
            {experience.map((ex: any) => (
              <div key={ex.id} style={{ fontSize: `${fs - 0.5}pt` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: 700, color: "#0d1117" }}>
                  <span style={{ fontSize: `${fs}pt` }}>{ex.company}</span>
                  <span style={{ fontWeight: 400, fontStyle: "italic", color: "#555" }}>{ex.duration}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", color: "#333", fontStyle: "italic", marginTop: "1px", marginBottom: "2px" }}>
                  <span style={{ fontWeight: 500 }}>{ex.role}</span>
                  <span style={{ color: "#555", fontWeight: 500 }}>{ex.location}</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: "1.2em", color: "#1c1c1c" }}>
                  {ex.bullets.map((b: string, i: number) => (
                    <li key={i} style={{ paddingLeft: "4px", marginBottom: "3px", lineHeight: lh }}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EDUCATION ── */}
      {education?.length > 0 && (
        <div style={{ marginBottom: `${sp}px` }}>
          {sec("Education")}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {education.map((e: any) => (
              <div key={e.id} style={{ fontSize: `${fs - 0.5}pt` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: 700, color: "#0d1117" }}>
                  <span style={{ fontSize: `${fs}pt` }}>{e.institution}</span>
                  <span style={{ fontWeight: 400, fontStyle: "italic", color: "#555" }}>{e.years}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", color: "#333", fontStyle: "italic", marginTop: "1px" }}>
                  <span style={{ fontWeight: 500 }}>{e.degree}</span>
                  <span style={{ color: "#555", fontWeight: 500 }}>{e.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TECHNICAL SKILLS ── */}
      {skills?.length > 0 && (
        <div style={{ marginBottom: `${sp}px` }}>
          {sec("Technical Skills")}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: `${fs - 0.5}pt`, color: "#1c1c1c" }}>
            {skills.map((sg: any) => (
              <div key={sg.id}>
                <span style={{ fontWeight: 700, color: "#0d1117" }}>{sg.category}: </span>
                <span style={{ fontWeight: 400 }}>{sg.skills.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PROJECTS ── */}
      {projects?.length > 0 && (
        <div style={{ marginBottom: `${sp}px` }}>
          {sec("Projects")}
          <div style={{ display: "flex", flexDirection: "column", gap: `${sp * 0.65}px` }}>
            {projects.map((p: any) => (
              <div key={p.id} style={{ fontSize: `${fs - 0.5}pt` }}>
                {/* Title row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: 700, color: "#0d1117" }}>
                  <span style={{ fontSize: `${fs}pt` }}>{p.title}</span>
                  <span style={{ fontWeight: 400, fontStyle: "italic", color: "#555" }}>{p.year}</span>
                </div>
                {/* Links */}
                {(p.githubUrl || p.liveUrl) && (
                  <div style={{ display: "flex", gap: "10px", marginTop: "1px", marginBottom: "2px", fontSize: `${fs - 1}pt` }}>
                    {p.githubUrl && (
                      <span style={{ color: "#555", fontStyle: "italic" }}>
                        GitHub:{" "}
                        <a href={p.githubUrl} target="_blank" rel="noreferrer" style={{ color: "#002fa7", fontStyle: "normal", fontWeight: 600 }}>Repository</a>
                      </span>
                    )}
                    {p.liveUrl && (
                      <span style={{ color: "#555", fontStyle: "italic" }}>
                        Live:{" "}
                        <a href={p.liveUrl} target="_blank" rel="noreferrer" style={{ color: "#002fa7", fontStyle: "normal", fontWeight: 600 }}>Website</a>
                      </span>
                    )}
                  </div>
                )}
                {/* Tech stack (if no links) */}
                {p.techStack?.length > 0 && !p.githubUrl && !p.liveUrl && (
                  <div style={{ color: "#555", fontStyle: "italic", marginTop: "1px", marginBottom: "2px" }}>
                    <span style={{ fontWeight: 600, fontStyle: "normal" }}>Stack: </span>{p.techStack.join(", ")}
                  </div>
                )}
                {/* Bullets with sharp black dots */}
                <ul style={{ paddingLeft: "0", marginTop: "2px", listStyle: "none", display: "flex", flexDirection: "column", gap: "1px" }}>
                  {p.bullets.map((b: string, i: number) => (
                    <li key={i} style={{ display: "flex", gap: "5px", color: "#1c1c1c", textAlign: "justify" }}>
                      <span style={{ width: "4px", height: "4px", background: "#0d1117", borderRadius: "50%", flexShrink: 0, marginTop: "0.45em", display: "inline-block" }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CERTIFICATIONS & ACHIEVEMENTS ── */}
      {certifications?.length > 0 && (
        <div style={{ marginBottom: `${sp}px` }}>
          {sec("Certifications & Achievements")}
          <div style={{ display: "flex", flexDirection: "column", gap: `${sp * 0.55}px` }}>
            {certifications.map((c: any) => (
              <div key={c.id} style={{ fontSize: `${fs - 0.5}pt` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: 700, color: "#0d1117" }}>
                  <span style={{ fontSize: `${fs}pt` }}>{c.title}{c.issuer ? ` — ${c.issuer}` : ""}</span>
                  <span style={{ fontWeight: 400, fontStyle: "italic", color: "#555" }}>{c.year}</span>
                </div>
                {(c.certificateUrl || c.badgeUrl) && (
                  <div style={{ display: "flex", gap: "10px", fontSize: `${fs - 1}pt`, marginTop: "1px", marginBottom: "2px" }}>
                    {c.certificateUrl && <a href={c.certificateUrl} target="_blank" rel="noreferrer" style={{ color: "#002fa7", fontWeight: 600 }}>View Certificate</a>}
                    {c.badgeUrl && <a href={c.badgeUrl} target="_blank" rel="noreferrer" style={{ color: "#002fa7", fontWeight: 600 }}>View Badge</a>}
                  </div>
                )}
                <ul style={{ paddingLeft: "0", marginTop: "2px", listStyle: "none", display: "flex", flexDirection: "column", gap: "1px" }}>
                  {c.bullets.map((b: string, i: number) => (
                    <li key={i} style={{ display: "flex", gap: "5px", color: "#1c1c1c", textAlign: "justify" }}>
                      <span style={{ width: "4px", height: "4px", background: "#0d1117", borderRadius: "50%", flexShrink: 0, marginTop: "0.45em", display: "inline-block" }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════
   LAYOUT 2 — TWO-COLUMN PRO
   Narrow left sidebar (grey bg) with contact/edu/skills
   Wide right main with summary, projects, certs
══════════════════════════════════════════════════════════════════ */
function TwoColumnPro({ data, fs, lh, mar, sp, font, icons }: any) {
  const { personalInfo: pi, professionalSummary, experience, education, skills, projects, certifications } = data;

  const sidebarSec = (title: string) => (
    <div style={{ fontSize: `${fs - 0.5}pt`, fontWeight: 800, color: "#1e3a8a", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid #c7d2fe", paddingBottom: "2px", marginBottom: "5px", marginTop: `${sp * 0.8}px` }}>
      {title}
    </div>
  );
  const mainSec = (title: string) => (
    <div style={{ fontSize: `${fs}pt`, fontWeight: 800, color: "#111827", letterSpacing: "0.03em", textTransform: "uppercase", borderBottom: "2px solid #1d4ed8", paddingBottom: "2px", marginBottom: "5px", marginTop: `${sp}px` }}>
      {title}
    </div>
  );

  return (
    <div style={{ fontSize: `${fs}pt`, lineHeight: lh, fontFamily: "inherit", display: "flex", minHeight: "11in" }}>
      {/* LEFT SIDEBAR */}
      <div style={{ width: "32%", background: "#f0f4ff", padding: `${mar * 0.8}in ${mar * 0.55}in`, borderRight: "1px solid #c7d2fe", boxSizing: "border-box" }}>
        {/* Name */}
        <div style={{ fontSize: `${fs + 8}pt`, fontWeight: 900, color: "#1e3a8a", lineHeight: 1.1, marginBottom: "6px" }}>{pi.name}</div>

        {/* Contact */}
        {sidebarSec("Contact")}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: `${fs - 1}pt`, color: "#374151" }}>
          {isValidLink(pi.phone, "phone") && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>{icons && <Phone size={8} />}{pi.phone}</span>}
          {isValidLink(pi.email, "email") && <a href={`mailto:${pi.email}`} style={{ color: "#1d4ed8", display: "flex", alignItems: "center", gap: "4px" }}>{icons && <Mail size={8} />}{pi.email}</a>}
          {isValidLink(pi.github, "github") && <a href={pi.github} target="_blank" rel="noreferrer" style={{ color: "#1d4ed8", display: "flex", alignItems: "center", gap: "4px" }}>{icons && <Github size={8} />}{extractUsername(pi.github, "github")}</a>}
          {isValidLink(pi.linkedin, "linkedin") && <a href={pi.linkedin} target="_blank" rel="noreferrer" style={{ color: "#1d4ed8", display: "flex", alignItems: "center", gap: "4px" }}>{icons && <Linkedin size={8} />}{extractUsername(pi.linkedin, "linkedin")}</a>}
          {isValidLink(pi.leetcode, "leetcode") && <a href={pi.leetcode} target="_blank" rel="noreferrer" style={{ color: "#1d4ed8", display: "flex", alignItems: "center", gap: "4px" }}>{icons && <Code size={8} />}{extractUsername(pi.leetcode, "leetcode")}</a>}
        </div>

        {/* Education in sidebar */}
        {education?.length > 0 && <>
          {sidebarSec("Education")}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {education.map((e: any) => (
              <div key={e.id} style={{ fontSize: `${fs - 1}pt` }}>
                <div style={{ fontWeight: 700, color: "#1e3a8a" }}>{e.institution}</div>
                <div style={{ color: "#4b5563", fontStyle: "italic" }}>{e.degree}</div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: `${fs - 1.5}pt` }}>
                  <span>{e.location}</span><span>{e.years}</span>
                </div>
              </div>
            ))}
          </div>
        </>}

        {/* Skills in sidebar */}
        {skills?.length > 0 && <>
          {sidebarSec("Skills")}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: `${fs - 1}pt` }}>
            {skills.map((sg: any) => (
              <div key={sg.id}>
                <div style={{ fontWeight: 700, color: "#1e3a8a", marginBottom: "2px" }}>{sg.category}</div>
                <div style={{ color: "#4b5563" }}>{sg.skills.join(" • ")}</div>
              </div>
            ))}
          </div>
        </>}
      </div>

      {/* RIGHT MAIN */}
      <div style={{ flex: 1, padding: `${mar * 0.8}in ${mar * 0.8}in ${mar * 0.8}in ${mar * 0.7}in`, boxSizing: "border-box" }}>
        {professionalSummary && <>
          {mainSec("Profile")}
          <p style={{ color: "#374151", textAlign: "justify" }}>{professionalSummary}</p>
        </>}

        {projects?.length > 0 && <>
          {mainSec("Projects")}
          <div style={{ display: "flex", flexDirection: "column", gap: `${sp * 0.7}px` }}>
            {projects.map((p: any) => (
              <div key={p.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#111827" }}>
                  <span>{p.title}</span><span style={{ fontWeight: 400, fontStyle: "italic", color: "#6b7280" }}>{p.year}</span>
                </div>
                {p.techStack?.length > 0 && <div style={{ color: "#6366f1", fontSize: `${fs - 0.5}pt`, fontStyle: "italic", marginBottom: "2px" }}>{p.techStack.join(" · ")}</div>}
                <ul style={{ paddingLeft: "14px", marginTop: "2px", display: "flex", flexDirection: "column", gap: "1px" }}>
                  {p.bullets.map((b: string, i: number) => <li key={i} style={{ listStyleType: "disc", color: "#374151", textAlign: "justify" }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </>}

        {certifications?.length > 0 && <>
          {mainSec("Certifications & Achievements")}
          <div style={{ display: "flex", flexDirection: "column", gap: `${sp * 0.5}px` }}>
            {certifications.map((c: any) => (
              <div key={c.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#111827" }}>
                  <span>{c.title}{c.issuer ? ` — ${c.issuer}` : ""}</span><span style={{ fontWeight: 400, fontStyle: "italic", color: "#6b7280" }}>{c.year}</span>
                </div>
                <ul style={{ paddingLeft: "14px", marginTop: "2px", display: "flex", flexDirection: "column", gap: "1px" }}>
                  {c.bullets.map((b: string, i: number) => <li key={i} style={{ listStyleType: "disc", color: "#374151", textAlign: "justify" }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LAYOUT 3 — BOLD BANNER
   Full-width colored header bar, white text name,
   Skills shown as inline pills under a colored bar
══════════════════════════════════════════════════════════════════ */
function BoldBanner({ data, fs, lh, mar, sp, font, icons }: any) {
  const { personalInfo: pi, professionalSummary, experience, education, skills, projects, certifications } = data;
  const ACCENT = "#c0392b";

  const sec = (title: string) => (
    <div style={{ fontSize: `${fs + 1}pt`, fontWeight: 800, color: ACCENT, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "5px", marginTop: `${sp}px`, borderBottom: `1.5px solid ${ACCENT}`, paddingBottom: "2px" }}>
      {title}
    </div>
  );

  const allSkills = skills?.flatMap((sg: any) => sg.skills) ?? [];

  return (
    <div style={{ fontSize: `${fs}pt`, lineHeight: lh, fontFamily: "inherit" }}>
      {/* BANNER HEADER */}
      <div style={{ background: ACCENT, padding: `${mar * 0.55}in ${mar}in ${mar * 0.4}in`, color: "white" }}>
        <div style={{ fontSize: `${fs + 13}pt`, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.0 }}>{pi.name}</div>
        <ContactLine data={pi} showIcons={icons} separator="  ·  " className="mt-2 text-[8.5pt] text-red-100" />
      </div>

      {/* SKILLS PILL BAR */}
      {skills?.length > 0 && (
        <div style={{ background: "#fff0ee", borderBottom: `1px solid #fecaca`, padding: `6px ${mar}in`, display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {skills.map((sg: any) =>
            sg.skills.slice(0, 4).map((s: string, i: number) => (
              <span key={`${sg.id}-${i}`} style={{ background: "white", border: `1px solid ${ACCENT}`, borderRadius: "3px", padding: "1px 7px", fontSize: `${fs - 1}pt`, color: ACCENT, fontWeight: 600 }}>{s}</span>
            ))
          )}
        </div>
      )}

      {/* CONTENT */}
      <div style={{ padding: `${mar * 0.55}in ${mar}in` }}>
        {/* Summary */}
        {professionalSummary && <div style={{ marginBottom: `${sp}px` }}>
          {sec("Profile")}
          <p style={{ color: "#374151", textAlign: "justify", marginTop: "3px" }}>{professionalSummary}</p>
        </div>}

        {/* Education — two column grid if multiple */}
        {education?.length > 0 && (
          <div style={{ marginBottom: `${sp * 0.8}px` }}>
            {sec("Education")}
            <div style={{ display: "grid", gridTemplateColumns: education.length > 1 ? "1fr 1fr" : "1fr", gap: "8px", marginTop: "3px" }}>
              {education.map((e: any) => (
                <div key={e.id} style={{ background: "#fff8f7", border: "1px solid #fecaca", borderRadius: "4px", padding: "6px 8px" }}>
                  <div style={{ fontWeight: 700, color: "#111827" }}>{e.degree}</div>
                  <div style={{ color: "#6b7280", fontSize: `${fs - 0.5}pt` }}>{e.institution}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#9ca3af", fontSize: `${fs - 1}pt` }}>
                    <span>{e.location}</span><span>{e.years}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills full breakdown */}
        {skills?.length > 0 && (
          <div style={{ marginBottom: `${sp * 0.8}px` }}>
            {sec("Technical Skills")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginTop: "3px" }}>
              {skills.map((sg: any) => (
                <div key={sg.id}>
                  <span style={{ fontWeight: 700, color: "#374151" }}>{sg.category}: </span>
                  <span style={{ color: "#6b7280" }}>{sg.skills.join(", ")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <div style={{ marginBottom: `${sp * 0.8}px` }}>
            {sec("Projects & Experience")}
            <div style={{ display: "flex", flexDirection: "column", gap: `${sp * 0.6}px`, marginTop: "3px" }}>
              {projects.map((p: any) => (
                <div key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#111827" }}>
                    <span>{p.title}</span><span style={{ fontWeight: 400, color: "#9ca3af" }}>{p.year}</span>
                  </div>
                  {p.techStack?.length > 0 && <div style={{ fontSize: `${fs - 0.5}pt`, color: ACCENT, fontStyle: "italic" }}>{p.techStack.join(" · ")}</div>}
                  <ul style={{ paddingLeft: "14px", marginTop: "2px", display: "flex", flexDirection: "column", gap: "1px" }}>
                    {p.bullets.map((b: string, i: number) => <li key={i} style={{ listStyleType: "disc", color: "#374151" }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications?.length > 0 && (
          <div>
            {sec("Certifications & Achievements")}
            <div style={{ display: "flex", flexDirection: "column", gap: `${sp * 0.5}px`, marginTop: "3px" }}>
              {certifications.map((c: any) => (
                <div key={c.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#111827" }}>
                    <span>{c.title}{c.issuer ? ` — ${c.issuer}` : ""}</span><span style={{ fontWeight: 400, color: "#9ca3af" }}>{c.year}</span>
                  </div>
                  <ul style={{ paddingLeft: "14px", marginTop: "2px", display: "flex", flexDirection: "column", gap: "1px" }}>
                    {c.bullets.map((b: string, i: number) => <li key={i} style={{ listStyleType: "disc", color: "#374151" }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LAYOUT 4 — ACADEMIC TABULAR
   Small-caps LARGE section headings, education in <table>,
   classic academic LaTeX feel with ruled table rows
══════════════════════════════════════════════════════════════════ */
function AcademicTabular({ data, fs, lh, mar, sp, font, icons }: any) {
  const { personalInfo: pi, professionalSummary, experience, education, skills, projects, certifications } = data;

  const sec = (title: string) => (
    <div style={{ fontVariant: "small-caps", fontSize: `${fs + 2}pt`, fontWeight: 700, borderBottom: "1px solid #111827", paddingBottom: "1px", marginBottom: "5px", marginTop: `${sp}px`, color: "#111827", letterSpacing: "0.04em" }}>
      {title}
    </div>
  );

  return (
    <div style={{ fontSize: `${fs}pt`, lineHeight: lh, padding: `${mar * 0.8}in ${mar}in`, fontFamily: "inherit" }}>
      {/* HEADER — name top-left, contact top-right */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: `${sp}px`, borderBottom: "1.5px solid #111827", paddingBottom: "6px" }}>
        <div>
          <div style={{ fontSize: `${fs + 10}pt`, fontWeight: 900, color: "#111827", letterSpacing: "-0.01em" }}>{pi.name}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: `${fs - 0.5}pt`, color: "#374151", lineHeight: 1.6 }} className="flex flex-col items-end">
          {isValidLink(pi.phone, "phone") && <div className="flex items-center gap-1.5">{icons && <Phone size={8} />}{pi.phone}</div>}
          {isValidLink(pi.email, "email") && <div><a href={`mailto:${pi.email}`} className="flex items-center gap-1.5" style={{ color: "#1d4ed8" }}>{icons && <Mail size={8} />}{pi.email}</a></div>}
          {isValidLink(pi.github, "github") && <div><a href={pi.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5" style={{ color: "#1d4ed8" }}>{icons && <Github size={8} />}{extractUsername(pi.github, "github")}</a></div>}
          {isValidLink(pi.linkedin, "linkedin") && <div><a href={pi.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5" style={{ color: "#1d4ed8" }}>{icons && <Linkedin size={8} />}{extractUsername(pi.linkedin, "linkedin") ?? "LinkedIn"}</a></div>}
        </div>
      </div>

      {/* Summary */}
      {professionalSummary && <div style={{ marginBottom: `${sp}px` }}>
        {sec("Objective")}
        <p style={{ color: "#374151", textAlign: "justify" }}>{professionalSummary}</p>
      </div>}

      {/* EDUCATION — proper HTML table */}
      {education?.length > 0 && (
        <div style={{ marginBottom: `${sp}px` }}>
          {sec("Education")}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: `${fs - 0.5}pt` }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #d1d5db" }}>
                {["Year", "Degree / Certificate", "Institute", "GPA / Grade"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "2px 6px", fontWeight: 700, color: "#374151", fontVariant: "small-caps" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {education.map((e: any) => (
                <tr key={e.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "2px 6px", color: "#6b7280", whiteSpace: "nowrap" }}>{e.years}</td>
                  <td style={{ padding: "2px 6px", color: "#111827", fontWeight: 600 }}>{e.degree}</td>
                  <td style={{ padding: "2px 6px", color: "#374151" }}>{e.institution}, {e.location}</td>
                  <td style={{ padding: "2px 6px", color: "#6b7280" }}>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Skills */}
      {skills?.length > 0 && (
        <div style={{ marginBottom: `${sp}px` }}>
          {sec("Technical Skills")}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {skills.map((sg: any) => (
              <div key={sg.id}>
                <span style={{ fontWeight: 700, fontVariant: "small-caps" }}>{sg.category}: </span>
                <span style={{ color: "#374151" }}>{sg.skills.join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <div style={{ marginBottom: `${sp}px` }}>
          {sec("Projects")}
          <div style={{ display: "flex", flexDirection: "column", gap: `${sp * 0.5}px` }}>
            {projects.map((p: any, idx: number) => (
              <div key={p.id}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontWeight: 700 }}>•</span>
                  <span style={{ fontWeight: 700, color: "#111827" }}>{p.title}</span>
                  {p.techStack?.length > 0 && <span style={{ color: "#6b7280", fontStyle: "italic", fontSize: `${fs - 0.5}pt` }}>({p.techStack.join(", ")})</span>}
                  <span style={{ marginLeft: "auto", color: "#6b7280", fontStyle: "italic", whiteSpace: "nowrap" }}>{p.year}</span>
                </div>
                <ul style={{ paddingLeft: "20px", marginTop: "2px", display: "flex", flexDirection: "column", gap: "1px" }}>
                  {p.bullets.map((b: string, i: number) => <li key={i} style={{ listStyleType: "none", color: "#374151" }}>– {b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications?.length > 0 && (
        <div>
          {sec("Certifications & Achievements")}
          <div style={{ display: "flex", flexDirection: "column", gap: `${sp * 0.4}px` }}>
            {certifications.map((c: any) => (
              <div key={c.id}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontWeight: 700 }}>•</span>
                  <span style={{ fontWeight: 700 }}>{c.title}{c.issuer ? ` — ${c.issuer}` : ""}</span>
                  <span style={{ marginLeft: "auto", color: "#6b7280", fontStyle: "italic", whiteSpace: "nowrap" }}>{c.year}</span>
                </div>
                {c.bullets.length > 0 && <ul style={{ paddingLeft: "20px", marginTop: "2px" }}>
                  {c.bullets.map((b: string, i: number) => <li key={i} style={{ listStyleType: "none", color: "#374151" }}>– {b}</li>)}
                </ul>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "20px", fontSize: `${fs - 1.5}pt`, color: "#9ca3af", borderTop: "1px solid #e5e7eb", paddingTop: "6px" }}>
        Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LAYOUT 5 — CV ACADEMIC (Jing Wang style)
   Name + title top-left, contact info right-aligned
   Sections with date in a left column, content right
   Teal/green underlines for university hyperlinks style
══════════════════════════════════════════════════════════════════ */
function CvAcademic({ data, fs, lh, mar, sp, font, icons }: any) {
  const { personalInfo: pi, professionalSummary, experience, education, skills, projects, certifications } = data;

  const sec = (title: string) => (
    <div style={{ fontSize: `${fs + 1}pt`, fontWeight: 700, color: "#111827", borderBottom: "1.5px solid #374151", paddingBottom: "2px", marginBottom: "6px", marginTop: `${sp}px` }}>
      {title}
    </div>
  );

  const Row = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => (
    <div style={{ display: "flex", gap: "16px", marginBottom: "5px" }}>
      <div style={{ width: "70px", flexShrink: 0, color: "#6b7280", fontSize: `${fs - 0.5}pt`, paddingTop: "1px", textAlign: "right" }}>{left}</div>
      <div style={{ flex: 1 }}>{right}</div>
    </div>
  );

  return (
    <div style={{ fontSize: `${fs}pt`, lineHeight: lh, padding: `${mar * 0.8}in ${mar}in`, fontFamily: "inherit" }}>
      {/* HEADER — name left, contact right */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
        <div>
          <div style={{ fontSize: `${fs + 11}pt`, fontWeight: 900, color: "#111827", lineHeight: 1.1 }}>{pi.name}</div>
          <div style={{ fontSize: `${fs - 0.5}pt`, color: "#6b7280", marginTop: "3px", fontStyle: "italic" }}>Curriculum Vitae</div>
        </div>
        <div style={{ textAlign: "right", fontSize: `${fs - 0.5}pt`, color: "#374151", lineHeight: 1.8 }} className="flex flex-col items-end">
          {isValidLink(pi.phone, "phone") && <div className="flex items-center gap-1.5">{icons && <Phone size={8} />}{pi.phone}</div>}
          {isValidLink(pi.email, "email") && <div><a href={`mailto:${pi.email}`} className="flex items-center gap-1.5" style={{ color: "#0d9488" }}>{icons && <Mail size={8} />}{pi.email}</a></div>}
          {isValidLink(pi.github, "github") && <div><a href={pi.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5" style={{ color: "#0d9488" }}>{icons && <Github size={8} />}{extractUsername(pi.github, "github")}</a></div>}
          {isValidLink(pi.linkedin, "linkedin") && <div><a href={pi.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5" style={{ color: "#0d9488" }}>{icons && <Linkedin size={8} />}{extractUsername(pi.linkedin, "linkedin") ?? "LinkedIn"}</a></div>}
        </div>
      </div>
      <div style={{ borderBottom: "1.5px solid #111827", marginBottom: `${sp}px` }} />

      {/* Summary */}
      {professionalSummary && <div style={{ marginBottom: `${sp}px` }}>
        {sec("Research Interests")}
        <p style={{ color: "#374151", textAlign: "justify" }}>{professionalSummary}</p>
      </div>}

      {/* Education — date left, content right */}
      {education?.length > 0 && (
        <div style={{ marginBottom: `${sp}px` }}>
          {sec("Education")}
          {education.map((e: any) => (
            <Row key={e.id}
              left={e.years}
              right={
                <div>
                  <span style={{ fontWeight: 700, color: "#111827" }}>{e.degree}</span>
                  <span style={{ color: "#6b7280" }}>, {e.institution}, </span>
                  <a style={{ color: "#0d9488", fontStyle: "italic" }}>{e.location}</a>
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* Skills */}
      {skills?.length > 0 && (
        <div style={{ marginBottom: `${sp}px` }}>
          {sec("Skills & Expertise")}
          {skills.map((sg: any) => (
            <Row key={sg.id}
              left={<span style={{ fontWeight: 600 }}>{sg.category}</span>}
              right={<span style={{ color: "#374151" }}>{sg.skills.join(", ")}</span>}
            />
          ))}
        </div>
      )}

      {/* Projects — date left */}
      {projects?.length > 0 && (
        <div style={{ marginBottom: `${sp}px` }}>
          {sec("Projects & Publications")}
          {projects.map((p: any) => (
            <Row key={p.id}
              left={p.year}
              right={
                <div>
                  <div style={{ fontWeight: 700, color: "#111827" }}>{p.title}</div>
                  {p.techStack?.length > 0 && <div style={{ color: "#6b7280", fontStyle: "italic", fontSize: `${fs - 0.5}pt` }}>{p.techStack.join(", ")}</div>}
                  <ul style={{ paddingLeft: "12px", marginTop: "2px" }}>
                    {p.bullets.map((b: string, i: number) => <li key={i} style={{ listStyleType: "disc", color: "#374151" }}>{b}</li>)}
                  </ul>
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications?.length > 0 && (
        <div>
          {sec("Certifications & Achievements")}
          {certifications.map((c: any) => (
            <Row key={c.id}
              left={c.year}
              right={
                <div>
                  <span style={{ fontWeight: 700 }}>{c.title}</span>
                  {c.issuer && <span style={{ color: "#6b7280" }}> — {c.issuer}</span>}
                  <ul style={{ paddingLeft: "12px", marginTop: "2px" }}>
                    {c.bullets.map((b: string, i: number) => <li key={i} style={{ listStyleType: "disc", color: "#374151" }}>{b}</li>)}
                  </ul>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LAYOUT 6 — MINIMAL INK
   No borders, no rules, no color — only weight & whitespace.
   Ultra-clean, looks premium and editorial.
══════════════════════════════════════════════════════════════════ */
function MinimalInk({ data, fs, lh, mar, sp, font, icons }: any) {
  const { personalInfo: pi, professionalSummary, experience, education, skills, projects, certifications } = data;

  const sec = (title: string) => (
    <div style={{ fontSize: `${fs - 0.5}pt`, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "6px", marginTop: `${sp * 1.2}px` }}>
      {title}
    </div>
  );

  return (
    <div style={{ fontSize: `${fs}pt`, lineHeight: lh, padding: `${mar * 1}in ${mar * 1.1}in`, fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{ marginBottom: `${sp * 0.8}px` }}>
        <div style={{ fontSize: `${fs + 14}pt`, fontWeight: 900, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1.0 }}>{pi.name}</div>
        <ContactLine data={pi} showIcons={icons} separator="  ·  " className="mt-2 text-[9pt] text-neutral-500" />
      </div>

      {professionalSummary && <>
        {sec("About")}
        <p style={{ color: "#374151", textAlign: "justify", maxWidth: "100%" }}>{professionalSummary}</p>
      </>}

      {education?.length > 0 && <>
        {sec("Education")}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {education.map((e: any) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontWeight: 700, color: "#111827" }}>{e.degree}</span>
                <span style={{ color: "#9ca3af" }}> — {e.institution}</span>
              </div>
              <span style={{ color: "#9ca3af", whiteSpace: "nowrap", paddingLeft: "12px" }}>{e.years}</span>
            </div>
          ))}
        </div>
      </>}

      {skills?.length > 0 && <>
        {sec("Skills")}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {skills.map((sg: any) => (
            <div key={sg.id}>
              <span style={{ fontWeight: 700, color: "#374151" }}>{sg.category} </span>
              <span style={{ color: "#6b7280" }}>{sg.skills.join(", ")}</span>
            </div>
          ))}
        </div>
      </>}

      {projects?.length > 0 && <>
        {sec("Work")}
        <div style={{ display: "flex", flexDirection: "column", gap: `${sp * 0.7}px` }}>
          {projects.map((p: any) => (
            <div key={p.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, color: "#111827" }}>{p.title}</span>
                <span style={{ color: "#9ca3af", fontSize: `${fs - 0.5}pt`, paddingLeft: "12px" }}>{p.year}</span>
              </div>
              {p.techStack?.length > 0 && <div style={{ color: "#9ca3af", fontSize: `${fs - 0.5}pt` }}>{p.techStack.join(" · ")}</div>}
              <ul style={{ paddingLeft: "0", marginTop: "2px", listStyle: "none", display: "flex", flexDirection: "column", gap: "1px" }}>
                {p.bullets.map((b: string, i: number) => <li key={i} style={{ color: "#4b5563", paddingLeft: "10px", textIndent: "-10px" }}>– {b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </>}

      {certifications?.length > 0 && <>
        {sec("Recognition")}
        <div style={{ display: "flex", flexDirection: "column", gap: `${sp * 0.5}px` }}>
          {certifications.map((c: any) => (
            <div key={c.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, color: "#111827" }}>{c.title}{c.issuer ? ` — ${c.issuer}` : ""}</span>
                <span style={{ color: "#9ca3af", fontSize: `${fs - 0.5}pt`, paddingLeft: "12px" }}>{c.year}</span>
              </div>
              {c.bullets.length > 0 && <ul style={{ paddingLeft: "0", marginTop: "2px", listStyle: "none" }}>
                {c.bullets.map((b: string, i: number) => <li key={i} style={{ color: "#4b5563", paddingLeft: "10px", textIndent: "-10px" }}>– {b}</li>)}
              </ul>}
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN EXPORT — dispatches to the correct layout component
══════════════════════════════════════════════════════════════════ */
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
  const fc = fontClass(fontTheme);
  const shared = { data, fs: fontSize, lh: lineHeight, mar: margins, sp: sectionSpacing, font: fc, icons: showIcons };

  const renderLayout = () => {
    switch (resumeLayout) {
      case "two-column":   return <TwoColumnPro   {...shared} />;
      case "bold-banner":  return <BoldBanner     {...shared} />;
      case "tabular":      return <AcademicTabular {...shared} />;
      case "cv-academic":  return <CvAcademic     {...shared} />;
      case "minimal":      return <MinimalInk     {...shared} />;
      default:             return <ClassicScholar  {...shared} />;
    }
  };

  return (
    <div
      id="latex-print-view"
      className={`print-container bg-white text-black ${fc} mx-auto w-[8.5in] min-h-[11in] shadow-2xl border border-slate-200 transition-all duration-300 relative select-text overflow-hidden`}
    >
      {renderLayout()}

      {/* Page boundary guide — screen only */}
      <div className="absolute left-0 right-0 top-[11in] border-t-2 border-dashed border-rose-400/60 pointer-events-none print:hidden flex items-center justify-end z-10">
        <span className="bg-rose-500 text-white text-[8.5px] font-mono tracking-wider px-2 py-0.5 rounded-l shadow-sm -mt-3.5 backdrop-blur-xs select-none">
          PAGE 1 BOUNDARY (11" PRINT LIMIT)
        </span>
      </div>
    </div>
  );
};
