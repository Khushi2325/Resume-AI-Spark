<div align="center">

<img src="app-icon.svg" alt="Resume AI Spark Logo" width="130"/>

# Resume AI Spark

### AI-Powered Resume Builder with Real-Time Preview, Resume Analysis, PDF Import, and Secure Cloud Storage

Resume AI Spark is a modern web application that helps students, job seekers, and professionals create polished, ATS-friendly resumes without struggling with formatting, templates, or repetitive editing.

The platform combines real-time resume building, AI-assisted content enhancement, PDF importing, resume quality analysis, and secure cloud storage into a single seamless experience.

Rather than spending hours adjusting layouts and rewriting bullet points, users can focus on showcasing their skills, achievements, and professional journey while the platform handles the technical complexity.

</div>

---

# Table of Contents

- Overview
- Motivation
- Features
- How It Works
- Technology Stack
- Architecture
- Core Functionalities
- AI Capabilities
- Security & Authentication
- Database Design
- Installation
- Environment Variables
- Running Locally
- Deployment
- Challenges Solved
- Future Improvements
- Contributing
- License

---

# Overview

Resume AI Spark was created to simplify one of the most frustrating tasks for students and professionals: creating and maintaining a high-quality resume.

Many resume builders suffer from several common limitations:

- Limited customization
- Expensive premium subscriptions
- Poor AI assistance
- Weak ATS compatibility
- Difficult formatting controls
- No resume quality feedback

Resume AI Spark addresses these issues by combining modern web technologies with artificial intelligence to provide a complete resume creation and improvement platform.

Users can:

- Create resumes from scratch
- Import existing resumes
- Edit content interactively
- Receive AI-powered suggestions
- Analyze resume quality
- Export professional PDFs
- Save resumes securely online

---

# Motivation

Building a resume should not require design expertise.

Many talented students and professionals struggle to present their achievements effectively because they spend more time fighting formatting issues than improving content.

Resume AI Spark was designed to remove these barriers.

The goal is simple:

> Help people build stronger resumes faster while maintaining complete ownership of their content.

---

# Features

## Interactive Resume Builder

The application provides a clean and intuitive editing experience.

Users can:

- Add personal information
- Manage education details
- Showcase projects
- Add certifications
- Highlight technical skills
- Create professional experience sections

All updates are reflected immediately in the preview.

---

## Real-Time PDF Preview

Resume AI Spark provides instant PDF rendering.

As users modify their resume:

- Layout updates automatically
- Formatting changes appear instantly
- Page structure remains visible
- Final output remains predictable

This eliminates the need for repeated exports during editing.

---

## Smart PDF Import

Already have a resume?

Simply upload an existing PDF.

The application intelligently extracts:

- Resume content
- Hyperlinks
- Structured sections
- Important information

Imported content is automatically mapped into editable fields, reducing manual work significantly.

---

## Resume Quality Analysis

The platform evaluates resume quality using multiple criteria.

### Grammar Evaluation

Identifies:

- Grammar issues
- Sentence structure problems
- Writing inconsistencies

### Content Strength Analysis

Evaluates:

- Achievement-focused language
- Action verbs
- Professional tone

### Repetition Detection

Highlights repeated phrases that may weaken resume impact.

### ATS Compatibility Review

Analyzes how effectively the resume may perform inside Applicant Tracking Systems.

### Resume Score

Provides an overall score that helps users track improvements over time.

---

## Smart Space Budgeting

One of the most useful features of Resume AI Spark.

Many users accidentally overflow content onto additional pages.

The application continuously monitors available space and provides warnings before content exceeds the recommended one-page format.

Benefits include:

- Better readability
- Cleaner formatting
- Improved recruiter experience
- Stronger resume presentation

---

## JSON Backup & Restore

Users maintain complete ownership of their data.

Resume AI Spark allows:

- JSON exports
- Local backups
- Easy restoration
- Resume portability

This ensures users never lose their work.

---

## Secure Authentication

Authentication is handled using Supabase.

Supported providers:

- Google
- GitHub

Users can securely access their resumes across multiple devices.

---

## Personal Cloud Workspace

Every authenticated user receives a private workspace.

Users can:

- Save resumes
- Continue editing later
- Access data from different devices
- Maintain multiple resume versions

---

# How It Works

```text
User Login
     │
     ▼
Create Resume / Import PDF
     │
     ▼
Edit Resume Content
     │
     ▼
AI Analysis & Suggestions
     │
     ▼
Resume Quality Evaluation
     │
     ▼
Real-Time PDF Preview
     │
     ▼
Export Professional Resume
```

---

# Technology Stack

## Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React

## Backend

- Node.js
- Express.js

## Artificial Intelligence

- Google Gemini API
- Gemini 2.5 Flash

## Database

- PostgreSQL
- Supabase

## Authentication

- Supabase Auth
- Google OAuth
- GitHub OAuth

## PDF Processing

- pdf-parse
- Native Canvas Bindings

## Build Tools

- Vite
- ESBuild

---

# Architecture

```text
┌─────────────────────────┐
│        Frontend         │
│ React + TypeScript      │
└─────────────┬───────────┘
              │
              ▼
┌─────────────────────────┐
│      Express Server     │
└───────┬────────┬────────┘
        │        │
        ▼        ▼

   Gemini AI   Supabase

        │
        ▼

   PDF Parser Engine
```

---

# Core Functionalities

## Resume Creation

Build resumes from scratch using structured forms and dynamic sections.

---

## Resume Editing

Modify content at any time with instant visual feedback.

---

## Resume Importing

Convert existing PDFs into editable resume data.

---

## Resume Exporting

Generate clean, professional PDF files ready for job applications.

---

## Resume Storage

Save resumes securely inside a cloud-based environment.

---

## Resume Recovery

Restore previously exported JSON backups whenever needed.

---

# AI Capabilities

Resume AI Spark integrates Google's Gemini AI to help users improve their resume content.

## Professional Rewriting

Transforms simple statements into stronger professional descriptions.

Example:

Before:

```text
Worked on website development.
```

After:

```text
Developed and optimized responsive web applications, improving usability and overall performance.
```

---

## Grammar Enhancement

Improves:

- Grammar
- Readability
- Clarity
- Professional tone

---

## Impact Suggestions

Helps users add measurable achievements and stronger action-oriented language.

---

## Content Refinement

Makes bullet points more concise, effective, and recruiter-friendly.

---

# Security & Authentication

Security is treated as a first-class feature.

The application uses:

- Supabase Authentication
- OAuth Sign-In
- PostgreSQL Database
- Row Level Security (RLS)

Every user can only access their own information.

This ensures complete data isolation and privacy.

---

# Database Design

The application uses Supabase PostgreSQL for storing:

- User profiles
- Resume information
- Resume sections
- Backup data
- User preferences

Row Level Security policies prevent unauthorized access.

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Khushi2325/Resume-AI-Spark.git

cd Resume-AI-Spark
```

---

## Install Dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL

VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

---

# Running Locally

Start the development environment:

```bash
npm run dev
```

Application URL:

```text
http://localhost:3000
```

---

# Deployment

Resume AI Spark can be deployed on:

- Render
- Railway
- Vercel
- AWS
- DigitalOcean

The backend uses ESBuild with externalized native dependencies to ensure PDF parsing functions correctly in production environments.

---

# Challenges Solved

During development, several technical challenges were addressed:

### PDF Parsing

Extracting structured information from uploaded resumes while preserving links and formatting.

### Native Dependencies

Handling PDF parsing libraries that rely on native binaries during deployment.

### Real-Time Synchronization

Maintaining instant synchronization between editor changes and PDF rendering.

### AI Integration

Creating a smooth workflow where AI-generated suggestions can be reviewed before being applied.

### Data Security

Implementing secure authentication and database isolation using Supabase Row Level Security.

---

# Future Improvements

Planned enhancements include:

- Multiple Resume Templates
- Cover Letter Generator
- Resume Version History
- Job Description Matching
- ATS Optimization Dashboard
- AI Interview Preparation
- Multi-Language Support
- Resume Sharing Links
- Collaborative Editing
- Custom Themes

---

# Contributing

Contributions are welcome.

To contribute:

1. Fork the repository
2. Create a feature branch
3. Make improvements
4. Commit changes
5. Submit a Pull Request

Feedback, bug reports, and feature suggestions are always appreciated.

---

# Project Vision

Resume AI Spark is more than a resume builder.

The long-term vision is to create a platform that helps people present themselves more effectively in professional environments through intelligent assistance, automation, and modern design.

By combining AI, cloud technologies, and real-time feedback, Resume AI Spark aims to make professional resume creation accessible to everyone.

---

# License

This project is licensed under the MIT License.

See the `LICENSE` file for additional information.

---

<div align="center">

Built with the goal of making resume creation simpler, smarter, and more accessible.

</div>