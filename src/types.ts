export interface PersonalInfo {
  name: string;
  phone: string;
  email: string;
  github: string;
  linkedin: string;
  leetcode: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  years: string;
  degree: string;
  location: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  duration: string;
  location: string;
  bullets: string[];
}

export interface SkillGroup {
  id: string;
  category: string;
  skills: string[];
}

export interface ProjectEntry {
  id: string;
  title: string;
  year: string;
  bullets: string[];
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
}

export interface CertificationEntry {
  id: string;
  title: string;
  issuer: string;
  year: string;
  bullets: string[];
  certificateUrl?: string;
  badgeUrl?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: SkillGroup[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
}
