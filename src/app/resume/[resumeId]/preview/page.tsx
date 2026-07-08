"use client";

import { useEffect, useState, useRef } from "react";
import { Eye, Download, Sparkles, Mail, Phone, MapPin, Globe, Cpu, AlertTriangle, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getResumeById } from "@/apis/resume.api";
import { calculateAtsScore } from "@/apis/ai.api";
import { IResume } from "@/types/resume.types";

export default function ResumePreviewPage() {
  const router = useRouter();
  const { resumeId } = useParams() as { resumeId: string };

  const [resume, setResume] = useState<IResume | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ATS Score State
  const [jobDescription, setJobDescription] = useState("");
  const [atsResult, setAtsResult] = useState<{
    score: number;
    matchingKeywords: string[];
    missingKeywords: string[];
    suggestions: string[];
  } | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);

  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await getResumeById(resumeId);
        if (response.success && (response.data as { resume?: IResume } | undefined)?.resume) {
          setResume((response.data as { resume: IResume }).resume);
        }
      } catch (error) {
        console.error("Error fetching resume", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [resumeId]);

  const handleCalculateAts = async () => {
    if (!jobDescription.trim() || !resume) return;
    try {
      setAtsLoading(true);
      
      // Compile resume details into simple text representation for scanner
      const resumeText = `
        ${resume.personalInfo?.fullname || ""}
        ${resume.title || ""}
        ${resume.summary || ""}
        Skills: ${resume.skills?.join(", ") || ""}
        Projects: ${resume.projects?.map(p => `${p.title}: ${p.desciption}`).join("\n") || ""}
        Experience: ${resume.workExperience?.map(w => `${w.company} - ${w.position}: ${w.desciption}`).join("\n") || ""}
        Education: ${resume.education?.map(e => `${e.institute} - ${e.degree}`).join("\n") || ""}
      `;

      const response = await calculateAtsScore({
        resumeText,
        jobDescription,
      });

      if (response.success && response.data) {
        const resData = response.data as {
          atsScore?: number;
          matchedKeywords?: string[];
          missingKeywords?: string[];
          recommendations?: string[];
        };
        setAtsResult({
          score: resData.atsScore || 70,
          matchingKeywords: resData.matchedKeywords || [],
          missingKeywords: resData.missingKeywords || [],
          suggestions: resData.recommendations || [],
        });
      }
    } catch (error) {
      console.error("Error calculating ATS", error);
    } finally {
      setAtsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center text-zinc-400 font-mono text-sm">
        Loading Resume...
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center text-zinc-400 gap-4">
        <AlertTriangle size={48} className="text-zinc-500" />
        <h2 className="text-xl font-bold">Resume not found</h2>
        <button onClick={() => router.push("/resume")} className="px-5 py-2.5 bg-white text-black font-bold rounded-xl text-xs uppercase tracking-wider">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/resume")}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Actions Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sticky top-6 space-y-6">
              <div>
                <h2 className="font-extrabold text-lg text-white mb-2">Resume Actions</h2>
                <p className="text-zinc-500 text-xs font-medium">Verify compatibility and export.</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-200 text-black px-4 py-3 rounded-xl font-bold transition text-xs uppercase tracking-wider shadow-lg shadow-white/5"
                >
                  <Download size={16} />
                  Download PDF
                </button>

                <button
                  onClick={() => router.push(`/resume/${resumeId}`)}
                  className="w-full flex items-center justify-center gap-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white px-4 py-3 rounded-xl font-bold transition text-xs uppercase tracking-wider"
                >
                  <Eye size={16} />
                  Edit Resume
                </button>
              </div>

              {/* Mini ATS Match Section */}
              <div className="border-t border-zinc-900 pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-zinc-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">ATS Optimizer</span>
                </div>

                <textarea
                  rows={4}
                  placeholder="Paste target Job Description here to scan..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-zinc-500 transition-colors resize-none placeholder:text-zinc-650"
                />

                <button
                  onClick={handleCalculateAts}
                  disabled={atsLoading || !jobDescription.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  {atsLoading ? "Scanning..." : "Scan Match"}
                </button>

                {atsResult && (
                  <div className="pt-4 border-t border-zinc-900 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="24" cy="24" r="20" className="stroke-zinc-900 fill-transparent" strokeWidth="3" />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            className="stroke-white fill-transparent transition-all duration-500"
                            strokeWidth="3"
                            strokeDasharray={`${2 * Math.PI * 20}`}
                            strokeDashoffset={`${2 * Math.PI * 20 * (1 - atsResult.score / 100)}`}
                          />
                        </svg>
                        <span className="absolute text-xs font-black text-white">{atsResult.score}%</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono leading-tight">
                        Match Score
                      </div>
                    </div>

                    {/* Missing Keywords badge */}
                    {atsResult.missingKeywords.length > 0 && (
                      <div className="text-[9px] font-mono">
                        <span className="text-zinc-400 font-bold block mb-1">Missing Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {atsResult.missingKeywords.slice(0, 5).map((kw, i) => (
                            <span key={i} className="py-0.5 px-1.5 bg-zinc-900 border border-zinc-850 text-zinc-400 rounded-md">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resume Preview Sheet Column */}
          <div className="lg:col-span-3">
            {/* Sheet styles for printing */}
            <style>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                #resume-preview-sheet, #resume-preview-sheet * {
                  visibility: visible;
                }
                #resume-preview-sheet {
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

            <div
              id="resume-preview-sheet"
              ref={resumeRef}
              className="bg-white text-zinc-900 p-10 rounded-3xl shadow-2xl relative select-text min-h-[1000px] space-y-8"
            >
              {/* Header profile details */}
              <div className="text-center border-b border-zinc-200 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-800 uppercase">
                  {resume.personalInfo?.fullname || "Your Name"}
                </h1>
                <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase mt-1">
                  {resume.title || "Target Role"}
                </p>

                {/* Contacts */}
                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5 mt-4 text-[10px] text-zinc-500 font-medium">
                  {resume.personalInfo?.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={13} className="text-zinc-400" />
                      {resume.personalInfo.email}
                    </span>
                  )}
                  {resume.personalInfo?.mobile && (
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-zinc-400" />
                      {resume.personalInfo.mobile}
                    </span>
                  )}
                  {resume.personalInfo?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-zinc-400" />
                      {resume.personalInfo.location}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5 mt-1.5 text-[10px] text-zinc-600">
                  {resume.personalInfo?.github && (
                    <span className="flex items-center gap-1">
                      <Globe size={13} />
                      github.com/{resume.personalInfo.github}
                    </span>
                  )}
                  {resume.personalInfo?.portfolio && (
                    <span className="flex items-center gap-1">
                      <Globe size={13} />
                      {resume.personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, "")}
                    </span>
                  )}
                </div>
              </div>

              {/* Summary */}
              {resume.summary && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-1">
                    Professional Summary
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                    {resume.summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              {resume.skills && resume.skills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-1">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {resume.skills.map((skill) => (
                      <span key={skill} className="text-[10px] bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-md font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {resume.workExperience && resume.workExperience.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-1">
                    Work Experience
                  </h3>
                  <div className="space-y-4">
                    {resume.workExperience.map((exp, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-bold text-zinc-800">
                            {exp.position} &mdash; <span className="font-semibold text-zinc-650">{exp.company}</span>
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {exp.startDate} &mdash; {exp.endDate}
                          </span>
                        </div>
                        {exp.desciption && (
                          <p className="text-[11px] text-zinc-600 leading-relaxed font-sans whitespace-pre-line">
                            {exp.desciption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {resume.projects && resume.projects.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-1">
                    Projects
                  </h3>
                  <div className="space-y-4">
                    {resume.projects.map((proj, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-bold text-zinc-800">
                            {proj.title}
                          </span>
                          <div className="flex gap-2 text-[10px] text-zinc-500 font-mono">
                            {proj.githubUrl && <span>GitHub</span>}
                            {proj.liveUrl && <span>Live Demo</span>}
                          </div>
                        </div>
                        {proj.techStack && proj.techStack.length > 0 && (
                          <div className="text-[9px] font-mono text-zinc-500">
                            Tech: {proj.techStack.join(", ")}
                          </div>
                        )}
                        {proj.desciption && (
                          <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">
                            {proj.desciption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {resume.education && resume.education.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-1">
                    Education
                  </h3>
                  <div className="space-y-2">
                    {resume.education.map((edu, i) => (
                      <div key={i} className="flex justify-between items-baseline">
                        <div>
                          <span className="text-xs font-bold text-zinc-800">{edu.degree}</span>
                          <span className="text-xs text-zinc-600">, {edu.institute}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {edu.startDate} &mdash; {edu.endDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {resume.certifications && resume.certifications.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-200 pb-1">
                    Certifications
                  </h3>
                  <ul className="list-disc pl-4 text-[11px] text-zinc-600 space-y-1">
                    {resume.certifications.map((cert, i) => (
                      <li key={i}>{cert}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
