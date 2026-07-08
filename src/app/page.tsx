"use client";

import React, { useState, useRef } from "react";
import {
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Globe,
  Plus,
  Trash2,
  Cpu,
  Brain,
  Wand2,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  LogOut,
  Target,
  PenTool,
  Search,
} from "lucide-react";

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

import { loginUser, registerUser } from "@/apis/auth.api";
import { createResume, getResumeById, updateResume } from "@/apis/resume.api";
import {
  generateSummary,
  generateSkills,
  generateProjectDescription,
  generateExperienceDescription,
  improveContent,
  calculateAtsScore,
} from "@/apis/ai.api";

import { IResume, IWorkExperience, IProjects, IEducation } from "@/types/resume.types";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let toastIdCounter = 0;

export default function Home() {
  // Navigation & Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  // Auth Forms State
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  // Resume State
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resume, setResume] = useState<IResume>({
    title: "My Resume",
    summary: "",
    personalInfo: {
      fullname: "",
      email: "",
      mobile: "",
      location: "",
      github: "",
      linkedIn: "",
      portfolio: "",
    },
    workExperience: [],
    projects: [],
    education: [],
    certifications: [],
  });

  // Active Editor Section Tab
  const [activeTab, setActiveTab] = useState<"personal" | "experience" | "projects" | "education" | "certifications">("personal");

  // AI Inputs & Results State
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [experienceLevelInput, setExperienceLevelInput] = useState("Mid-Level");
  const [skillsKeywordsInput, setSkillsKeywordsInput] = useState("");
  const [jobDescriptionInput, setJobDescriptionInput] = useState("");
  
  // Content Improver State
  const [improveInput, setImproveInput] = useState("");
  
  // ATS Result State
  const [atsResult, setAtsResult] = useState<{
    score: number;
    matchingKeywords: string[];
    missingKeywords: string[];
    suggestions: string[];
  } | null>(null);

  // Status & UI States
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Show Toast Helper
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = String(++toastIdCounter);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Auth Call Handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (authMode === "login") {
        const response = await loginUser({
          email: authForm.email,
          password: authForm.password,
        });
        if (response.success) {
          showToast(response.message || "Logged in successfully!");
          setIsLoggedIn(true);
          setShowAuthModal(false);
          const userData = response.data as { user?: { name: string; email: string } };
          if (userData?.user) {
            setCurrentUser(userData.user);
          }
          await handleFetchOrCreateResume();
        } else {
          showToast(response.message || "Authentication failed.", "error");
        }
      } else {
        const response = await registerUser({
          name: authForm.name,
          email: authForm.email,
          mobile: authForm.mobile,
          password: authForm.password,
        });
        if (response.success) {
          showToast(response.message || "Registered successfully!");
          setIsLoggedIn(true);
          setShowAuthModal(false);
          const userData = response.data as { user?: { name: string; email: string } };
          if (userData?.user) {
            setCurrentUser(userData.user);
          }
          await handleFetchOrCreateResume();
        } else {
          showToast(response.message || "Registration failed.", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Switched to sandbox demo mode.", "info");
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setCurrentUser({ name: authForm.name || "Demo User", email: authForm.email || "demo@example.com" });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch or Create Resume
  const handleFetchOrCreateResume = async () => {
    try {
      const createRes = await createResume();
      if (createRes.success) {
        const resumeData = createRes.data as { resume?: { _id: string } };
        const newId = resumeData?.resume?._id;
        if (newId) {
          setResumeId(newId);
          await loadResume(newId);
        }
      }
    } catch {
      console.warn("Mongoose create call failed. Running in browser sandbox.");
      showToast("Running in sandbox mode", "info");
    }
  };

  // Load Resume
  const loadResume = async (id: string) => {
    try {
      const getRes = await getResumeById(id);
      if (getRes.success) {
        const data = getRes.data as { resume?: IResume };
        if (data?.resume) {
          setResume(data.resume);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Resume Updates to API
  const saveResumeUpdates = async (updatedResume: IResume) => {
    if (!resumeId) return;
    try {
      await updateResume(resumeId, updatedResume);
    } catch (err) {
      console.error("Failed to sync resume with DB:", err);
    }
  };

  // Handle Field Updates
  const updatePersonalInfo = (field: keyof typeof resume.personalInfo, value: string) => {
    const updated = {
      ...resume,
      personalInfo: {
        ...resume.personalInfo,
        [field]: value,
      },
    };
    setResume(updated);
    saveResumeUpdates(updated);
  };

  const handleArrayUpdate = <T extends object>(
    key: "workExperience" | "projects" | "education",
    index: number,
    field: keyof T,
    value: string | string[]
  ) => {
    const arr = [...(resume[key] || [])] as unknown as Record<string, unknown>[];
    arr[index] = { ...arr[index], [field as string]: value };
    const updated = { ...resume, [key]: arr as unknown as typeof resume[typeof key] };
    setResume(updated);
    saveResumeUpdates(updated);
  };

  const handleAddArrayItem = (key: "workExperience" | "projects" | "education") => {
    let newItem = {};
    if (key === "workExperience") {
      newItem = { company: "", position: "", startDate: "", endDate: "", desciption: "" };
    } else if (key === "projects") {
      newItem = { title: "", desciption: "", githubUrl: "", liveUrl: "", techStack: [] };
    } else if (key === "education") {
      newItem = { institute: "", degree: "", startDate: "", endDate: "" };
    }
    const updated = {
      ...resume,
      [key]: [...(resume[key] || []), newItem],
    };
    setResume(updated);
    saveResumeUpdates(updated);
  };

  const handleRemoveArrayItem = (key: "workExperience" | "projects" | "education", index: number) => {
    const updated = {
      ...resume,
      [key]: (resume[key] || []).filter((_, i) => i !== index),
    };
    setResume(updated);
    saveResumeUpdates(updated);
  };

  const handleCertificationsChange = (val: string) => {
    const list = val.split(",").map((s) => s.trim()).filter((s) => s);
    const updated = { ...resume, certifications: list };
    setResume(updated);
    saveResumeUpdates(updated);
  };

  // AI summaries/skills generation handlers
  const handleGenerateSummary = async () => {
    if (!jobTitleInput.trim()) {
      showToast("Please enter a target Job Title in the AI Panel first.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const skillsArray = skillsKeywordsInput.split(",").map((s) => s.trim()).filter((s) => s);
      const res = await generateSummary({
        jobTitle: jobTitleInput,
        experienceLevel: experienceLevelInput,
        skills: skillsArray.length > 0 ? skillsArray : ["React", "JavaScript", "Software Design"],
      });
      if (res.success && res.data) {
        const result = res.data as { summary?: string };
        if (result.summary) {
          const updated = { ...resume, summary: result.summary };
          setResume(updated);
          saveResumeUpdates(updated);
          showToast("Summary generated and inserted successfully!");
        }
      }
    } catch {
      const mockSummary = `Driven and innovative ${experienceLevelInput} ${jobTitleInput} specializing in modern frontend and database design. Adept at building responsive web architectures and scaling clean codebase infrastructures.`;
      const updated = { ...resume, summary: mockSummary };
      setResume(updated);
      showToast("Demo Mode: Generated summary locally", "info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSkills = async () => {
    if (!jobTitleInput.trim()) {
      showToast("Please enter a target Job Title in the AI Panel first.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await generateSkills({
        jobTitle: jobTitleInput,
        experienceLevel: experienceLevelInput,
      });
      if (res.success && res.data) {
        const result = res.data as { skills?: string[] | string };
        let finalSkills: string[] = [];
        if (Array.isArray(result.skills)) {
          finalSkills = result.skills;
        } else if (typeof result.skills === "string") {
          try {
            finalSkills = JSON.parse(result.skills);
          } catch {
            finalSkills = result.skills.split(",").map((s) => s.trim());
          }
        }
        if (finalSkills.length > 0) {
          setSkillsKeywordsInput(finalSkills.join(", "));
          showToast("AI Skills suggestions generated below!");
        }
      }
    } catch {
      const mockSkills = ["React", "TypeScript", "Node.js", "REST APIs", "Git", "Next.js", "Problem Solving", "CI/CD"];
      setSkillsKeywordsInput(mockSkills.join(", "));
      showToast("Demo Mode: Generated skills keywords locally", "info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateWorkExpDescription = async (index: number) => {
    const exp = resume.workExperience?.[index];
    if (!exp?.company || !exp?.position) {
      showToast("Please fill in Company and Position fields to generate a description.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const skillsArray = skillsKeywordsInput.split(",").map((s) => s.trim()).filter((s) => s);
      const res = await generateExperienceDescription({
        company: exp.company,
        position: exp.position,
        keyResponsibilities: exp.desciption || undefined,
        skills: skillsArray,
      });
      if (res.success && res.data) {
        const result = res.data as { experienceDescription?: string };
        if (result.experienceDescription) {
          handleArrayUpdate<IWorkExperience>("workExperience", index, "desciption", result.experienceDescription);
          showToast("Work experience description generated!");
        }
      }
    } catch {
      const mockDesc = `Led engineering initiatives at ${exp.company} as a ${exp.position}. Designed and implemented robust scalable code structures, optimized data integrations, and resolved key bugs, boosting application load times by 25%.`;
      handleArrayUpdate<IWorkExperience>("workExperience", index, "desciption", mockDesc);
      showToast("Demo Mode: Generated description locally", "info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProjDescription = async (index: number) => {
    const proj = resume.projects?.[index];
    if (!proj?.title) {
      showToast("Please fill in the Project Title field first.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await generateProjectDescription({
        projectTitle: proj.title,
        projectType: "Web Application",
        techStack: proj.techStack?.length > 0 ? proj.techStack : ["React", "TypeScript"],
      });
      if (res.success && res.data) {
        const result = res.data as { projectDescription?: string };
        if (result.projectDescription) {
          handleArrayUpdate<IProjects>("projects", index, "desciption", result.projectDescription);
          showToast("Project description generated!");
        }
      }
    } catch {
      const mockProjDesc = `Engineered a performant ${proj.title} application using modern tools. Structured database relationships, created intuitive responsive user workflows, and improved general app SEO visibility.`;
      handleArrayUpdate<IProjects>("projects", index, "desciption", mockProjDesc);
      showToast("Demo Mode: Generated project description locally", "info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImproveContent = async () => {
    if (!improveInput.trim()) {
      showToast("Please write or paste some text to improve first.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await improveContent({ content: improveInput });
      if (res.success && res.data) {
        const result = res.data as { improvedContent?: string };
        if (result.improvedContent) {
          setImproveInput(result.improvedContent);
          showToast("Content polished successfully!");
        }
      }
    } catch {
      const mockImproved = `Polished: ${improveInput} (Refined utilizing professional vocabulary, strong action verbs, and active syntax for premium ATS compliance).`;
      setImproveInput(mockImproved);
      showToast("Demo Mode: Refined content locally", "info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleATSScoring = async () => {
    if (!jobDescriptionInput.trim()) {
      showToast("Please enter a target Job Description first.", "error");
      return;
    }
    const resumeText = `
      Name: ${resume.personalInfo.fullname}
      Title: ${resume.title}
      Summary: ${resume.summary}
      Experience: ${(resume.workExperience || []).map((w) => `${w.position} at ${w.company}. ${w.desciption}`).join(" ")}
      Projects: ${(resume.projects || []).map((p) => `${p.title}. ${p.desciption} Stack: ${p.techStack?.join(", ")}`).join(" ")}
    `;

    setIsLoading(true);
    try {
      const res = await calculateAtsScore({
        resumeText,
        jobDescription: jobDescriptionInput,
      });
      if (res.success && res.data) {
        setAtsResult(res.data as Exclude<typeof atsResult, null>);
        showToast("ATS Scan complete!");
      }
    } catch {
      const mockScore = {
        score: 78,
        matchingKeywords: ["React", "TypeScript", "Node.js", "Git", "REST APIs"],
        missingKeywords: ["CI/CD", "AWS", "Docker", "Unit Testing"],
        suggestions: [
          "Integrate Docker or cloud platform (AWS/GCP) mentions into your projects.",
          "Elaborate on CI/CD pipelines in your Work Experience entries.",
          "Add Unit Testing to your key skills profile.",
        ],
      };
      setAtsResult(mockScore);
      showToast("Demo Mode: ATS analyzed locally", "info");
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out Handler
  const handleSignOut = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setResumeId(null);
    setResume({
      title: "My Resume",
      summary: "",
      personalInfo: {
        fullname: "",
        email: "",
        mobile: "",
        location: "",
        github: "",
        linkedIn: "",
        portfolio: "",
      },
      workExperience: [],
      projects: [],
      education: [],
      certifications: [],
    });
    showToast("Signed out successfully.");
  };

  // Print/Export PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative min-h-screen bg-[#000000] text-slate-100 flex flex-col font-sans overflow-x-hidden select-none">
      
      {/* Background glowing gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/[0.01] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-white/[0.01] blur-[150px] pointer-events-none" />

      {/* Header bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-black/70 border-b border-zinc-900 py-4 px-6 md:px-12 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Briefly
            </span>
            <span className="text-xs block text-slate-400 font-mono tracking-widest mt-[-2px]">
              GEMINI RESUME BUILDER
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-200">{currentUser?.name}</span>
                <span className="text-xs text-slate-400 font-mono">{currentUser?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition duration-300 text-slate-400 flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode("login");
                setShowAuthModal(true);
              }}
              className="py-2.5 px-6 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all duration-300 flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main landing screen (when not logged in) */}
      {!isLoggedIn ? (
        <main className="flex-1 flex flex-col justify-center items-center px-6 py-20 text-center relative max-w-5xl mx-auto z-10">
          
          {/* Badge */}
          <div className="mb-6 py-1.5 px-4 bg-zinc-900 border border-zinc-800 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Powered by Gemini 3.5 Flash
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Design an Outstanding Resume. <br />
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Optimized by Advanced AI.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-light leading-relaxed">
            Construct standard resumes designed for ATS systems. Instantly polish bullet points, generate professional career summaries, suggest technical skills, and analyze job compatibility.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button
              onClick={() => {
                setAuthMode("register");
                setShowAuthModal(true);
              }}
              className="py-4 px-8 bg-white hover:bg-zinc-200 text-black text-base font-bold rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Create Account
            </button>
            <button
              onClick={() => {
                setAuthMode("login");
                setShowAuthModal(true);
              }}
              className="py-4 px-8 bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-base font-bold rounded-xl transition duration-300 transform hover:-translate-y-0.5"
            >
              Sign In to Resume Builder
            </button>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 w-full mt-10">
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-2xl text-left hover:border-zinc-700 transition group">
              <div className="p-3 bg-zinc-900 border border-zinc-800 text-white rounded-xl w-fit mb-4 group-hover:scale-110 transition">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-200">AI Resume Writer</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate high-quality summaries, work descriptions, and project tech logs written exactly for your target role.
              </p>
            </div>
            
            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-2xl text-left hover:border-zinc-700 transition group">
              <div className="p-3 bg-zinc-900 border border-zinc-800 text-white rounded-xl w-fit mb-4 group-hover:scale-110 transition">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-200">ATS Optimization</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Score your resume against any job description, identifying critical missing keywords and matching attributes.
              </p>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-900 rounded-2xl text-left hover:border-zinc-700 transition group">
              <div className="p-3 bg-zinc-900 border border-zinc-800 text-white rounded-xl w-fit mb-4 group-hover:scale-110 transition">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-slate-200">Instant AI Polish</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Paste any weak draft and watch the Gemini engine refine spelling, grammatical patterns, and action-verb vocabulary.
              </p>
            </div>
          </div>

        </main>
      ) : (
        /* Workspace Screen (when logged in) */
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 md:p-8 max-w-screen-2xl w-full mx-auto z-10 overflow-hidden">
          
          {/* Column 1: Builder/Editor Form (L: lg-span-4) */}
          <section className="lg:col-span-4 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="w-5 h-5 text-white" />
              <h2 className="font-extrabold text-lg tracking-tight text-slate-200">Resume Content Editor</h2>
            </div>

            {/* Sidebar navigation tabs */}
            <div className="flex gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl mb-6 overflow-x-auto">
              {(["personal", "experience", "projects", "education", "certifications"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition duration-200 whitespace-nowrap capitalize ${
                    activeTab === tab
                      ? "bg-white text-black shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-zinc-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content wrapper */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-mono text-xs">
              
              {/* Tab: Personal Info */}
              {activeTab === "personal" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400 block mb-1">Resume Document Title</label>
                    <input
                      type="text"
                      value={resume.title}
                      onChange={(e) => setResume({ ...resume, title: e.target.value })}
                      onBlur={() => saveResumeUpdates(resume)}
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={resume.personalInfo.fullname}
                      onChange={(e) => updatePersonalInfo("fullname", e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Email</label>
                      <input
                        type="email"
                        value={resume.personalInfo.email}
                        onChange={(e) => updatePersonalInfo("email", e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Mobile</label>
                      <input
                        type="tel"
                        value={resume.personalInfo.mobile}
                        onChange={(e) => updatePersonalInfo("mobile", e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Location (City, Country)</label>
                    <input
                      type="text"
                      value={resume.personalInfo.location}
                      onChange={(e) => updatePersonalInfo("location", e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">GitHub (Name)</label>
                      <input
                        type="text"
                        value={resume.personalInfo.github}
                        onChange={(e) => updatePersonalInfo("github", e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">LinkedIn (Name)</label>
                      <input
                        type="text"
                        value={resume.personalInfo.linkedIn}
                        onChange={(e) => updatePersonalInfo("linkedIn", e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Portfolio (URL)</label>
                      <input
                        type="text"
                        value={resume.personalInfo.portfolio}
                        onChange={(e) => updatePersonalInfo("portfolio", e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Summary Statement</label>
                    <textarea
                      rows={5}
                      value={resume.summary}
                      onChange={(e) => {
                        const updated = { ...resume, summary: e.target.value };
                        setResume(updated);
                        saveResumeUpdates(updated);
                      }}
                      placeholder="Write a summary, or generate one in the AI Tool panel on the right..."
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans leading-relaxed resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab: Work Experience */}
              {activeTab === "experience" && (
                <div className="space-y-6">
                  {(resume.workExperience || []).map((exp, index) => (
                    <div key={index} className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl relative space-y-3">
                      <button
                        onClick={() => handleRemoveArrayItem("workExperience", index)}
                        className="absolute top-3 right-3 text-slate-500 hover:text-red-400 p-1 rounded transition duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 block mb-1">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleArrayUpdate<IWorkExperience>("workExperience", index, "company", e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Position</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => handleArrayUpdate<IWorkExperience>("workExperience", index, "position", e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 block mb-1">Start Date</label>
                          <input
                            type="text"
                            placeholder="e.g. Jan 2024"
                            value={exp.startDate}
                            onChange={(e) => handleArrayUpdate<IWorkExperience>("workExperience", index, "startDate", e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">End Date</label>
                          <input
                            type="text"
                            placeholder="e.g. Present"
                            value={exp.endDate}
                            onChange={(e) => handleArrayUpdate<IWorkExperience>("workExperience", index, "endDate", e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-slate-400">Description & Accomplishments</label>
                          <button
                            onClick={() => handleGenerateWorkExpDescription(index)}
                            className="text-[10px] font-bold text-zinc-100 hover:text-white flex items-center gap-1 bg-zinc-800 border border-zinc-700 py-1 px-2 rounded-lg transition duration-200"
                          >
                            <Sparkles className="w-3 h-3" />
                            Generate Bullet Points
                          </button>
                        </div>
                        <textarea
                          rows={4}
                          value={exp.desciption}
                          onChange={(e) => handleArrayUpdate<IWorkExperience>("workExperience", index, "desciption", e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans leading-relaxed resize-none"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddArrayItem("workExperience")}
                    className="w-full py-3 bg-zinc-950 border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 rounded-2xl flex items-center justify-center gap-2 text-slate-300 hover:text-slate-100 transition duration-300 font-sans font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Add Work Experience
                  </button>
                </div>
              )}

              {/* Tab: Projects */}
              {activeTab === "projects" && (
                <div className="space-y-6">
                  {(resume.projects || []).map((proj, index) => (
                    <div key={index} className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl relative space-y-3">
                      <button
                        onClick={() => handleRemoveArrayItem("projects", index)}
                        className="absolute top-3 right-3 text-slate-500 hover:text-red-400 p-1 rounded transition duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div>
                        <label className="text-slate-400 block mb-1">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => handleArrayUpdate<IProjects>("projects", index, "title", e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 block mb-1">GitHub URL</label>
                          <input
                            type="text"
                            value={proj.githubUrl}
                            onChange={(e) => handleArrayUpdate<IProjects>("projects", index, "githubUrl", e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Live Demo URL</label>
                          <input
                            type="text"
                            value={proj.liveUrl}
                            onChange={(e) => handleArrayUpdate<IProjects>("projects", index, "liveUrl", e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Tech Stack (comma separated)</label>
                        <input
                          type="text"
                          value={proj.techStack?.join(", ")}
                          onChange={(e) => {
                            const stack = e.target.value.split(",").map((s) => s.trim());
                            handleArrayUpdate<IProjects>("projects", index, "techStack", stack);
                          }}
                          className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-slate-400">Description</label>
                          <button
                            onClick={() => handleGenerateProjDescription(index)}
                            className="text-[10px] font-bold text-zinc-100 hover:text-white flex items-center gap-1 bg-zinc-800 border border-zinc-700 py-1 px-2 rounded-lg transition duration-200"
                          >
                            <Sparkles className="w-3 h-3" />
                            Generate Description
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={proj.desciption}
                          onChange={(e) => handleArrayUpdate<IProjects>("projects", index, "desciption", e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans leading-relaxed resize-none"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddArrayItem("projects")}
                    className="w-full py-3 bg-zinc-950 border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 rounded-2xl flex items-center justify-center gap-2 text-slate-300 hover:text-slate-100 transition duration-300 font-sans font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Add Project
                  </button>
                </div>
              )}

              {/* Tab: Education */}
              {activeTab === "education" && (
                <div className="space-y-6">
                  {(resume.education || []).map((edu, index) => (
                    <div key={index} className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl relative space-y-3">
                      <button
                        onClick={() => handleRemoveArrayItem("education", index)}
                        className="absolute top-3 right-3 text-slate-500 hover:text-red-400 p-1 rounded transition duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div>
                        <label className="text-slate-400 block mb-1">Institute Name</label>
                        <input
                          type="text"
                          value={edu.institute}
                          onChange={(e) => handleArrayUpdate<IEducation>("education", index, "institute", e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Degree / Course</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleArrayUpdate<IEducation>("education", index, "degree", e.target.value)}
                          className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 block mb-1">Start Date</label>
                          <input
                            type="text"
                            value={edu.startDate}
                            onChange={(e) => handleArrayUpdate<IEducation>("education", index, "startDate", e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">End Date</label>
                          <input
                            type="text"
                            value={edu.endDate}
                            onChange={(e) => handleArrayUpdate<IEducation>("education", index, "endDate", e.target.value)}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddArrayItem("education")}
                    className="w-full py-3 bg-zinc-950 border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 rounded-2xl flex items-center justify-center gap-2 text-slate-300 hover:text-slate-100 transition duration-300 font-sans font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    Add Education
                  </button>
                </div>
              )}

              {/* Tab: Certifications */}
              {activeTab === "certifications" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400 block mb-1">Certifications (comma separated)</label>
                    <textarea
                      rows={5}
                      value={resume.certifications?.join(", ") || ""}
                      onChange={(e) => handleCertificationsChange(e.target.value)}
                      placeholder="e.g. AWS Certified Developer, Scrum Master, Google UX Design Certificate"
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 font-sans leading-relaxed resize-none"
                    />
                  </div>
                </div>
              )}

            </div>
          </section>

          {/* Column 2: Interactive Resume Preview (Center: lg-span-5) */}
          <section className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-white" />
                <h2 className="font-extrabold text-lg tracking-tight text-slate-200">Live Preview</h2>
              </div>
              <button
                onClick={handlePrint}
                className="py-2 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition duration-200 text-slate-300 flex items-center gap-2 font-bold text-xs"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>

            {/* Simulated Sheet Canvas */}
            <div className="flex-1 bg-white text-[#1a1a2e] p-8 rounded-2xl overflow-y-auto shadow-2xl relative select-text" ref={resumeRef}>
              
              {/* Sheet styles for printing */}
              <style>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #print-area, #print-area * {
                    visibility: visible;
                  }
                  #print-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    padding: 0;
                    margin: 0;
                    background: white;
                    color: black;
                  }
                }
              `}</style>

              <div id="print-area" className="space-y-6">
                
                {/* Header Profile section */}
                <div className="text-center border-b border-slate-200 pb-4">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-800 uppercase">
                    {resume.personalInfo.fullname || "Your Name"}
                  </h1>
                  <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase mt-1">
                    {resume.title || "Target Role"}
                  </p>
                  
                  {/* Contact Links */}
                  <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5 mt-3 text-[10px] text-slate-500 font-medium">
                    {resume.personalInfo.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {resume.personalInfo.email}
                      </span>
                    )}
                    {resume.personalInfo.mobile && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {resume.personalInfo.mobile}
                      </span>
                    )}
                    {resume.personalInfo.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {resume.personalInfo.location}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5 mt-1 text-[10px] text-zinc-600">
                    {resume.personalInfo.github && (
                      <a href={`https://github.com/${resume.personalInfo.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline hover:text-black">
                        <Github className="w-3.5 h-3.5" />
                        github.com/{resume.personalInfo.github}
                      </a>
                    )}
                    {resume.personalInfo.linkedIn && (
                      <a href={`https://linkedin.com/in/${resume.personalInfo.linkedIn}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline hover:text-black">
                        <Linkedin className="w-3.5 h-3.5" />
                        linkedin.com/in/{resume.personalInfo.linkedIn}
                      </a>
                    )}
                    {resume.personalInfo.portfolio && (
                      <a href={resume.personalInfo.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline hover:text-black">
                        <Globe className="w-3.5 h-3.5" />
                        {resume.personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, "")}
                      </a>
                    )}
                  </div>
                </div>

                {/* Section: Summary */}
                {resume.summary && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                      Professional Summary
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {resume.summary}
                    </p>
                  </div>
                )}

                {/* Section: Work Experience */}
                {resume.workExperience && resume.workExperience.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                      Professional Experience
                    </h3>
                    <div className="space-y-4">
                      {resume.workExperience.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-slate-800">
                              {exp.position} &mdash; <span className="font-semibold text-slate-600">{exp.company}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {exp.startDate} &mdash; {exp.endDate}
                            </span>
                          </div>
                          {exp.desciption && (
                            <p className="text-[11px] text-slate-600 leading-relaxed font-sans whitespace-pre-line">
                              {exp.desciption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Projects */}
                {resume.projects && resume.projects.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                      Projects & Applications
                    </h3>
                    <div className="space-y-3">
                      {resume.projects.map((proj, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-slate-800">
                              {proj.title}
                            </span>
                            <div className="flex gap-2 text-[10px] text-zinc-600">
                              {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="hover:underline hover:text-black">GitHub</a>}
                              {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="hover:underline hover:text-black">Live Link</a>}
                            </div>
                          </div>
                          {proj.techStack && proj.techStack.length > 0 && (
                            <div className="text-[10px] font-mono text-slate-500">
                              Technologies: {proj.techStack.join(", ")}
                            </div>
                          )}
                          {proj.desciption && (
                            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                              {proj.desciption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Education */}
                {resume.education && resume.education.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                      Education
                    </h3>
                    <div className="space-y-2">
                      {resume.education.map((edu, i) => (
                        <div key={i} className="flex justify-between items-baseline">
                          <div>
                            <span className="text-xs font-bold text-slate-800">{edu.degree}</span>
                            <span className="text-xs text-slate-600">, {edu.institute}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {edu.startDate} &mdash; {edu.endDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section: Certifications */}
                {resume.certifications && resume.certifications.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                      Certifications & Credentials
                    </h3>
                    <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-1">
                      {resume.certifications.map((cert, i) => (
                        <li key={i}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            </div>
          </section>

          {/* Column 3: AI Toolkit & Scoring (Right: lg-span-3) */}
          <section className="lg:col-span-3 space-y-6 h-[calc(100vh-140px)] min-h-[500px] overflow-y-auto pr-1">
            
            {/* Box 1: Gemini Generator Controls */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Brain className="w-5 h-5 text-white" />
                <h3 className="font-extrabold text-sm tracking-tight text-slate-200">Gemini Generator</h3>
              </div>

              <div className="space-y-3 text-[10px] font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">Target Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={jobTitleInput}
                    onChange={(e) => setJobTitleInput(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Experience Level</label>
                  <select
                    value={experienceLevelInput}
                    onChange={(e) => setExperienceLevelInput(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-300 text-xs font-sans"
                  >
                    <option value="Entry-Level">Entry-Level</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior-Level">Senior-Level</option>
                    <option value="Lead / Manager">Lead / Manager</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Skills Keywords (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. React, Next.js, Redux"
                    value={skillsKeywordsInput}
                    onChange={(e) => setSkillsKeywordsInput(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 text-xs font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={handleGenerateSkills}
                  className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-850 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition duration-300"
                >
                  <Search className="w-3.5 h-3.5" />
                  Suggest Skills
                </button>
                <button
                  onClick={handleGenerateSummary}
                  className="py-2.5 px-3 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition duration-300 shadow-md shadow-white/5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gen Summary
                </button>
              </div>
            </div>

            {/* Box 2: ATS Scanner & Scorer */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-white" />
                <h3 className="font-extrabold text-sm tracking-tight text-slate-200">ATS Match Optimizer</h3>
              </div>

              <div className="space-y-3">
                <textarea
                  rows={4}
                  placeholder="Paste target Job Description here to score compatibility..."
                  value={jobDescriptionInput}
                  onChange={(e) => setJobDescriptionInput(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 text-xs font-sans resize-none"
                />
                
                <button
                  onClick={handleATSScoring}
                  className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition duration-300 shadow-md shadow-white/5"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  Scan Resume
                </button>
              </div>

              {/* Circular Gauge Score display */}
              {atsResult && (
                <div className="space-y-4 pt-2 border-t border-zinc-800 font-sans">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="28" cy="28" r="24" className="stroke-white/5 fill-transparent" strokeWidth="4" />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          className="stroke-white fill-transparent transition-all duration-1000"
                          strokeWidth="4"
                          strokeDasharray={`${2 * Math.PI * 24}`}
                          strokeDashoffset={`${2 * Math.PI * 24 * (1 - atsResult.score / 100)}`}
                        />
                      </svg>
                      <span className="absolute text-sm font-black text-slate-200">{atsResult.score}%</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-300">Match score calculated</div>
                      <div className="text-[10px] text-slate-400">Targeting ATS filters</div>
                    </div>
                  </div>

                  {/* Matching/Missing badges */}
                  <div className="space-y-2 text-[10px] font-mono">
                    {atsResult.matchingKeywords.length > 0 && (
                      <div>
                        <span className="text-zinc-200 font-bold block mb-1">Matched Keywords:</span>
                        <div className="flex flex-wrap gap-1">
                          {atsResult.matchingKeywords.map((kw, i) => (
                            <span key={i} className="py-0.5 px-1.5 bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {atsResult.missingKeywords.length > 0 && (
                      <div className="pt-1.5">
                        <span className="text-zinc-400 font-bold block mb-1">Missing Keywords:</span>
                        <div className="flex flex-wrap gap-1">
                          {atsResult.missingKeywords.map((kw, i) => (
                            <span key={i} className="py-0.5 px-1.5 bg-zinc-900 border border-zinc-850 text-zinc-400 rounded-md">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions list */}
                    {atsResult.suggestions.length > 0 && (
                      <div className="pt-2 border-t border-zinc-800 text-[9px] text-slate-400 space-y-1">
                        <span className="text-slate-300 font-bold block text-[10px] mb-1 font-sans">Improvement Tips:</span>
                        {atsResult.suggestions.map((sug, i) => (
                          <div key={i} className="flex gap-1.5 leading-relaxed">
                            <span className="text-zinc-500">&bull;</span>
                            <span>{sug}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Box 3: Content Improver */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Wand2 className="w-5 h-5 text-white" />
                <h3 className="font-extrabold text-sm tracking-tight text-slate-200">Sentence Polisher</h3>
              </div>

              <div className="space-y-3">
                <textarea
                  rows={3}
                  placeholder="Paste a draft sentence or work experience point to rewrite..."
                  value={improveInput}
                  onChange={(e) => setImproveInput(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 text-xs font-sans resize-none"
                />
                
                <button
                  onClick={handleImproveContent}
                  className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition duration-300 shadow-md shadow-white/5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Polish Content
                </button>
              </div>
            </div>

          </section>

        </main>
      )}

      {/* Auth modal overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl w-full max-w-md relative shadow-2xl">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-lg p-1.5"
            >
              &times;
            </button>

            <h3 className="text-2xl font-black mb-1 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              {authMode === "login" ? "Welcome Back" : "Create Account"}
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-mono">
              {authMode === "login" ? "Enter details to access your resume" : "Create details to save progress"}
            </p>

            <form onSubmit={handleAuth} className="space-y-4 font-mono text-xs">
              {authMode === "register" && (
                <div>
                  <label className="text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 text-sm font-sans"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-400 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 text-sm font-sans"
                />
              </div>

              {authMode === "register" && (
                <div>
                  <label className="text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={authForm.mobile}
                    onChange={(e) => setAuthForm({ ...authForm, mobile: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 text-sm font-sans"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-400 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-lg py-2.5 px-3 focus:outline-none focus:border-zinc-500 transition text-slate-200 text-sm font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs tracking-wider transition-all duration-300 mt-6 shadow-lg shadow-white/5"
              >
                {isLoading ? "PROCESSSING..." : authMode === "login" ? "SIGN IN" : "REGISTER"}
              </button>
            </form>

            <div className="text-center mt-6 text-xs text-slate-400">
              {authMode === "login" ? (
                <span>
                  Don&apos;t have an account?{" "}
                  <button onClick={() => setAuthMode("register")} className="text-white hover:underline underline-offset-4">
                    Register Here
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{" "}
                  <button onClick={() => setAuthMode("login")} className="text-white hover:underline underline-offset-4">
                    Sign In
                  </button>
                </span>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Floating Notifications toast drawer */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="p-4 rounded-xl border bg-zinc-950/90 border-zinc-800 text-slate-100 flex items-start gap-3 shadow-xl backdrop-blur-md transition-all duration-300"
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />}
            {toast.type === "error" && <AlertTriangle className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />}
            {toast.type === "info" && <Sparkles className="w-5 h-5 text-zinc-200 shrink-0 mt-0.5" />}
            <div>
              <p className="text-xs font-semibold leading-relaxed font-sans">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}