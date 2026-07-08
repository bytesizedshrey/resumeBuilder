"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import { getResumeById, updateResume } from "@/apis/resume.api";
import { generateSkills } from "@/apis/ai.api";
import { IResume } from "@/types/resume.types";
import StepHeader from "./StepHeader";

interface Props {
  resumeId: string;
  onNext: () => void;
  onBack: () => void;
}

export default function SkillsStep({ resumeId, onNext, onBack }: Props) {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await getResumeById(resumeId);
        const resumeData = (response.data as { resume?: IResume } | undefined)?.resume;
        setSkills(resumeData?.skills || []);
      } catch (error) {
        console.error("Error fetching skills", error);
      }
    };
    fetchResume();
  }, [resumeId]);

  const addSkill = () => {
    if (!skillInput.trim()) return;
    if (skills.includes(skillInput.trim())) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, skillInput.trim()]);
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((item) => item !== skill));
  };

  const handleGenerateSkills = async () => {
    try {
      setAiLoading(true);
      const response = await getResumeById(resumeId);
      const resume = (response.data as { resume?: IResume } | undefined)?.resume;

      const aiResponse = await generateSkills({
        jobTitle: resume?.title || "Software Engineer",
        experienceLevel: "Mid-Level",
      });

      if (aiResponse.success && (aiResponse.data as { skills?: string[] } | undefined)?.skills) {
        setSkills((aiResponse.data as { skills: string[] }).skills);
      }
    } catch (error) {
      console.error("Error generating skills", error);
    } finally {
      setAiLoading(false);
    }
  };

  const saveSkills = async () => {
    try {
      setLoading(true);
      await updateResume(resumeId, {
        skills,
      });
      onNext();
    } catch (error) {
      console.error("Error saving skills", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <StepHeader step={3} />

        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Skills
              </h1>
              <p className="text-zinc-400 mt-1 text-sm font-medium">
                Add skills relevant to your role.
              </p>
            </div>

            <button
              onClick={handleGenerateSkills}
              disabled={aiLoading}
              className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold transition shadow-lg shadow-white/5 disabled:opacity-50 text-xs uppercase tracking-wider"
            >
              <Sparkles size={16} />
              {aiLoading ? "Generating..." : "Generate with AI"}
            </button>
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g. React, Python, Product Management"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              className="flex-1 bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
            />
            <button
              onClick={addSkill}
              type="button"
              className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-xl hover:bg-zinc-800 transition font-bold text-xs uppercase tracking-wider"
            >
              Add
            </button>
          </div>

          {/* Skills Badges */}
          <div className="flex flex-wrap gap-2.5 mt-8">
            {skills?.length === 0 ? (
              <p className="text-zinc-500 text-xs italic font-mono">No skills added yet.</p>
            ) : (
              skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-full text-xs font-semibold"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between mt-12 pt-6 border-t border-zinc-900">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-3 border border-zinc-850 text-zinc-300 rounded-xl hover:bg-zinc-900 transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button
              onClick={saveSkills}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold transition shadow-lg shadow-white/5 disabled:opacity-50 text-xs uppercase tracking-wider"
            >
              {loading ? "Saving..." : "Continue"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
