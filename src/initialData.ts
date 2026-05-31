import { ResumeData } from "./types";

export const initialResumeData: ResumeData = {
  personalInfo: {
    name: "Aarav Sharma",
    phone: "+91 98765 43210",
    email: "aarav.sharma@example.com",
    github: "https://github.com/aaravsharma",
    linkedin: "https://linkedin.com/in/aaravsharma",
    leetcode: "https://leetcode.com/aaravsharma",
  },
  professionalSummary:
    "Computer science student with a strong foundation in full-stack development, modern backend systems, and clean UI building. Focused on creating scalable products, improving performance, and turning ideas into polished user experiences. Comfortable with JavaScript, React, Node.js, and backend architecture basics.",
  education: [
    {
      id: "edu-1",
      institution: "City Engineering College",
      years: "2023 -- Present",
      degree: "Bachelor of Technology in Computer Science and Engineering | CGPA: 8.6/10",
      location: "Pune, Maharashtra",
    },
    {
      id: "edu-2",
      institution: "National Senior Secondary School",
      years: "2023",
      degree: "Higher Secondary Education (Class 12th) -- 88.4%",
      location: "Maharashtra",
    },
  ],
  experience: [
    {
      id: "exp-1",
      company: "TechNova Solutions",
      role: "Backend Developer Intern",
      duration: "Jun 2024 -- Aug 2024",
      location: "Pune, India (Remote)",
      bullets: [
        "Optimized database queries in Node.js, reducing API response times by 25%.",
        "Assisted in migrating legacy REST APIs to GraphQL, improving data fetching efficiency for the frontend client.",
        "Collaborated with the QA team to increase unit test coverage from 60% to 85% using Jest."
      ]
    }
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
      title: "FlowBoard -- Full Stack Productivity Dashboard",
      year: "2025",
      techStack: ["React.js", "Node.js", "Express.js", "REST APIs"],
      bullets: [
        "Built a responsive productivity dashboard for managing tasks, notes, and progress in one place.",
        "Designed REST APIs for smooth data syncing between the frontend and backend layers.",
        "Implemented reusable React components and a clean layout for a polished user experience.",
      ],
      githubUrl: "https://github.com/aaravsharma/flowboard",
      liveUrl: "https://demo.example.com",
    },
    {
      id: "proj-2",
      title: "SecureNest -- JWT-Based Authentication System",
      year: "2025",
      techStack: ["Node.js", "Express.js", "JWT", "bcrypt"],
      bullets: [
        "Built secure authentication and authorization flows using JWT validation and protected routes.",
        "Implemented password hashing with bcrypt and middleware-based access control.",
        "Structured backend modules using a clean, scalable, and maintainable architecture.",
      ],
      githubUrl: "https://github.com/aaravsharma/securenest",
    },
    {
      id: "proj-3",
      title: "GestureSync -- Real-Time Gesture Detection System",
      year: "2025",
      techStack: ["Python", "OpenCV", "TensorFlow"],
      bullets: [
        "Developed a real-time gesture detection model to recognize hand movements with useful accuracy.",
        "Integrated OpenCV for frame processing and TensorFlow for classification.",
        "Built the project to explore practical computer vision workflows and accessibility use cases.",
      ],
      githubUrl: "https://github.com/aaravsharma/gesturesync",
    },
    {
      id: "proj-4",
      title: "SmartSpend -- Personal Finance Tracker",
      year: "2024",
      techStack: ["React Native", "Firebase", "Redux"],
      bullets: [
        "Developed a cross-platform mobile application to help users track daily expenses and visualize financial health.",
        "Integrated Firebase real-time database to sync user data seamlessly across multiple devices with offline support.",
        "Designed intuitive data visualization charts and implemented state management using Redux for high performance.",
      ],
      githubUrl: "https://github.com/aaravsharma/smartspend",
    },
  ],
  certifications: [
    {
      id: "cert-1",
      issuer: "Cloud Academy",
      title: "Cloud Application Development Certificate",
      year: "2026",
      bullets: [
        "Certified in cloud app fundamentals, deployment workflows, and platform operations.",
      ],
      certificateUrl: "https://demo.example.com/certificate",
      badgeUrl: "https://demo.example.com/badge",
    },
    {
      id: "cert-2",
      issuer: "City Engineering College",
      title: "Hackathon Participation Certificate",
      year: "2025",
      bullets: [
        "Participated in collaborative software development and real-world problem-solving.",
      ],
      certificateUrl: "https://demo.example.com/hackathon",
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
  experience: [
    {
      id: "exp-blank-1",
      company: "",
      role: "",
      duration: "",
      location: "",
      bullets: [""],
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
