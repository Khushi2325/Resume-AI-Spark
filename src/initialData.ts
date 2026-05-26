import { ResumeData } from "./types";

export const initialResumeData: ResumeData = {
  personalInfo: {
    name: "KHUSHI K CHORVADI",
    phone: "+91 9512377089",
    email: "chorvadikhushi@gmail.com",
    github: "https://github.com/Khushi2325",
    linkedin: "https://linkedin.com/in/yourlinkedin",
    leetcode: "https://leetcode.com/yourleetcode",
  },
  professionalSummary:
    "Computer Science undergraduate with a solid foundation in Java, Data Structures, and backend development. Passionate about building scalable applications using modern practices. Experienced in developing RESTful APIs, full-stack projects, and secure authentication systems. Active LeetCode solver currently strengthening backend expertise in Spring Boot and system design.",
  education: [
    {
      id: "edu-1",
      institution: "Parul University",
      years: "2023 -- Present",
      degree: "Bachelor of Technology in Computer Science and Engineering | CGPA: 8.74/10",
      location: "Vadodara, Gujarat",
    },
    {
      id: "edu-2",
      institution: "Aditya Birla Higher Secondary School",
      years: "2023",
      degree: "Higher Secondary Education (Class 12th) -- 66.67%",
      location: "Gujarat",
    },
  ],
  skills: [
    {
      id: "skill-1",
      category: "Languages",
      skills: ["Java", "Python", "JavaScript"],
    },
    {
      id: "skill-2",
      category: "Backend Development",
      skills: ["Node.js", "Express.js", "REST APIs", "Spring Boot"],
    },
    {
      id: "skill-3",
      category: "Frontend Development",
      skills: ["React.js", "HTML", "CSS"],
    },
    {
      id: "skill-4",
      category: "Core Concepts",
      skills: ["Data Structures & Algorithms", "OOP", "DBMS", "System Design Basics"],
    },
    {
      id: "skill-5",
      category: "Tools & Platforms",
      skills: ["Git", "GitHub", "Postman"],
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "PathlyLab Posts -- Full Stack Blogging Platform",
      year: "2025",
      techStack: ["React.js", "Node.js", "Express.js", "REST APIs"],
      bullets: [
        "Developed a full-stack blogging platform for efficient post creation, editing, and management.",
        "Designed RESTful APIs for seamless frontend-backend communication and dynamic data flow.",
        "Implemented responsive React UI components and optimized flow for enhanced maintainability.",
      ],
      githubUrl: "https://github.com/yourusername/pathlylab-posts",
      liveUrl: "https://yourwebsite.com",
    },
    {
      id: "proj-2",
      title: "SecureAuth -- JWT-Based Authentication System",
      year: "2025",
      techStack: ["Node.js", "Express.js", "JWT", "bcrypt"],
      bullets: [
        "Built secure authentication and authorization systems using JWT validation and protected routes.",
        "Implemented password hashing via bcrypt and middleware-based role-based access control.",
        "Structured backend modules following clean, scalable, and maintainable architecture design.",
      ],
      githubUrl: "https://github.com/yourusername/secureauth",
    },
    {
      id: "proj-3",
      title: "Sign Language Detection System",
      year: "2025",
      techStack: ["Python", "OpenCV", "TensorFlow"],
      bullets: [
        "Developed an AI sign language detection model to recognize hand gestures in real time.",
        "Integrated OpenCV for image processing and TensorFlow for gesture prediction.",
        "Enhanced communication accessibility using real-time computer vision techniques.",
      ],
      githubUrl: "https://github.com/Khushi2325/sign-language-detection-model",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      issuer: "ServiceNow",
      title: "ServiceNow Certified System Administrator (CSA)",
      year: "2026",
      bullets: [
        "Certified in ServiceNow platform administration, workflows, and enterprise operations.",
      ],
      certificateUrl: "https://your-certificate-link.com",
      badgeUrl: "https://your-badge-link.com",
    },
    {
      id: "cert-2",
      issuer: "Parul University",
      title: "Smart India Hackathon Certification",
      year: "2025",
      bullets: [
        "Participated in collaborative software development and real-world problem-solving.",
      ],
      certificateUrl: "https://your-certificate-link.com",
    },
  ],
};

export const blankResumeData: ResumeData = {
  personalInfo: {
    name: "",
    phone: "",
    email: "",
    github: "",
    linkedin: "",
    leetcode: "",
  },
  professionalSummary: "",
  education: [
    {
      id: "edu-blank-1",
      institution: "",
      years: "",
      degree: "",
      location: "",
    }
  ],
  skills: [
    {
      id: "skill-blank-1",
      category: "Languages",
      skills: [],
    },
    {
      id: "skill-blank-2",
      category: "Backend Development",
      skills: [],
    },
    {
      id: "skill-blank-3",
      category: "Frontend Development",
      skills: [],
    },
  ],
  projects: [
    {
      id: "proj-blank-1",
      title: "",
      year: "",
      techStack: [],
      bullets: [""],
    }
  ],
  certifications: [
    {
      id: "cert-blank-1",
      issuer: "",
      title: "",
      year: "",
      bullets: [""],
    }
  ],
};
