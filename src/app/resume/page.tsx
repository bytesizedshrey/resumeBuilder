"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Trash2, Briefcase } from "lucide-react";
import { createResumeApi, deleteResumeApi, getAllResumesApi } from "@/apis/resume.api";

interface Resume {
  _id: string;
  title: string;
  jobTitle: string;
  experienceLevel: string;
}

export default function ResumePage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    jobTitle: "",
    experienceLevel: "Fresher",
  });

  const fetchResumes = useCallback(async () => {
    try {
      const data = await getAllResumesApi();
      setResumes(data.resumes || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResumes();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchResumes]);

  const handleCreateResume = async () => {
    if (!formData.title.trim()) return;
    try {
      const response = await createResumeApi({
        title: formData.title,
        jobTitle: formData.jobTitle,
        experienceLevel: formData.experienceLevel,
      });

      const resumeId = (response.data as { resume?: { _id: string } } | undefined)?.resume?._id;
      if (resumeId) {
        router.push(`/resume/${resumeId}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (resumeId: string) => {
    try {
      await deleteResumeApi(resumeId);
      fetchResumes();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 border-b border-zinc-900 pb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white">My Resumes</h1>
            <p className="text-zinc-400 mt-2 text-sm">
              Create and manage your ATS-optimized resumes.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-white hover:bg-zinc-200 text-black px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition shadow-lg shadow-white/5 text-sm"
          >
            <Plus size={18} />
            Create Resume
          </button>
        </div>

        {/* Empty State */}
        {!loading && resumes.length === 0 && (
          <div className="bg-zinc-950 rounded-3xl border border-zinc-900 p-16 text-center max-w-2xl mx-auto mt-12">
            <FileText size={64} className="mx-auto text-zinc-700 mb-6 animate-pulse" />
            <h2 className="text-2xl font-black text-white">No Resumes Yet</h2>
            <p className="text-zinc-500 mt-2 text-sm font-medium">
              Initialize your first professional AI resume builder.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-8 bg-white hover:bg-zinc-200 text-black px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-white/5 text-sm"
            >
              Create Resume
            </button>
          </div>
        )}

        {/* Resume Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className="bg-zinc-950 rounded-3xl p-6 border border-zinc-900 hover:border-zinc-800 transition-all duration-300 flex flex-col justify-between h-56"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="font-extrabold text-xl text-white tracking-tight leading-snug">{resume.title}</h2>
                  <div className="flex items-center gap-2 text-zinc-400 mt-2 text-xs font-mono">
                    <Briefcase size={14} className="text-zinc-500" />
                    {resume.jobTitle || "Not specified"}
                  </div>
                  <span className="inline-block mt-4 bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-semibold">
                    {resume.experienceLevel}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(resume._id)}
                  className="text-zinc-500 hover:text-white transition-colors p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <button
                onClick={() => router.push(`/resume/${resume._id}`)}
                className="mt-6 w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white py-3 rounded-xl transition text-xs font-bold uppercase tracking-wider"
              >
                Continue Building
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 z-50 transition-opacity">
          <div className="bg-zinc-950 w-full max-w-lg rounded-3xl p-8 border border-zinc-850 shadow-2xl relative">
            <h2 className="text-2xl font-black mb-6 text-white tracking-tight">Create Resume</h2>

            <div className="space-y-4 font-mono text-xs">
              <div className="space-y-2">
                <label className="text-zinc-400 block font-bold uppercase tracking-wider">Resume Title</label>
                <input
                  placeholder="e.g. My Frontend Resume"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors text-sm font-sans"
                />
              </div>

              <div className="space-y-2">
                <label className="text-zinc-400 block font-bold uppercase tracking-wider">Target Job Title</label>
                <input
                  placeholder="e.g. Senior React Developer"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jobTitle: e.target.value,
                    })
                  }
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-zinc-500 transition-colors text-sm font-sans"
                />
              </div>

              <div className="space-y-2">
                <label className="text-zinc-400 block font-bold uppercase tracking-wider">Experience Level</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experienceLevel: e.target.value,
                    })
                  }
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-zinc-300 focus:outline-none focus:border-zinc-500 transition-colors text-sm font-sans"
                >
                  <option>Fresher</option>
                  <option>Junior</option>
                  <option>Mid-Level</option>
                  <option>Senior</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-zinc-900">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-3 border border-zinc-850 hover:bg-zinc-900 text-zinc-300 rounded-xl transition text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateResume}
                className="px-5 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold transition text-xs uppercase tracking-wider shadow-lg shadow-white/5"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
