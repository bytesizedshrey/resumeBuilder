"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Plus, Trash2, Sparkles, FolderGit } from "lucide-react";
import { getResumeById, updateResume } from "@/apis/resume.api";
import { generateProjectDescription } from "@/apis/ai.api";
import { IResume, IProjects } from "@/types/resume.types";
import StepHeader from "./StepHeader";

interface Props {
  resumeId: string;
  onNext: () => void;
  onBack: () => void;
}

interface Project {
  title: string;
  techStack: string;
  description: string;
  githubUrl: string;
  liveUrl: string;
}

interface FormValues {
  projects: Project[];
}

export default function ProjectsStep({ resumeId, onNext, onBack }: Props) {
  const [aiLoading, setAiLoading] = useState<Record<number, boolean>>({});

  const {
    register,
    control,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      projects: [
        {
          title: "",
          techStack: "",
          description: "",
          githubUrl: "",
          liveUrl: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  });

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await getResumeById(resumeId);
        const resume = (response.data as { resume?: IResume } | undefined)?.resume;

        if (resume?.projects?.length) {
          reset({
            projects: resume.projects.map((project: IProjects) => ({
              title: project.title || "",
              techStack: Array.isArray(project.techStack)
                ? project.techStack.join(", ")
                : "",
              description: project.desciption || "", // Map backend desciption to frontend description
              githubUrl: project.githubUrl || "",
              liveUrl: project.liveUrl || "",
            })),
          });
        }
      } catch (error) {
        console.error("Error fetching projects", error);
      }
    };
    fetchResume();
  }, [resumeId, reset]);

  const generateDescription = async (index: number) => {
    try {
      setAiLoading((prev) => ({ ...prev, [index]: true }));
      const project = watch(`projects.${index}`);
      
      const techStackArray = project.techStack
        ? project.techStack.split(",").map((t) => t.trim()).filter(Boolean)
        : ["React", "TypeScript"];

      const aiResponse = await generateProjectDescription({
        projectTitle: project.title || "Software Project",
        projectType: "Full-stack application",
        techStack: techStackArray,
      });

      if (aiResponse.success && (aiResponse.data as { projectDescription?: string } | undefined)?.projectDescription) {
        setValue(`projects.${index}.description`, (aiResponse.data as { projectDescription: string }).projectDescription);
      }
    } catch (error) {
      console.error("Error generating project description", error);
    } finally {
      setAiLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const formattedProjects = values.projects.map((project) => ({
        title: project.title,
        techStack: project.techStack
          ? project.techStack.split(",").map((tech) => tech.trim()).filter(Boolean)
          : [],
        desciption: project.description, // Save as desciption for backend model schema compatibility
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
      }));

      await updateResume(resumeId, {
        projects: formattedProjects,
      });

      onNext();
    } catch (error) {
      console.error("Error saving projects", error);
    }
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <StepHeader step={4} />

        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                <FolderGit className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Projects</h1>
                <p className="text-zinc-400 mt-1 text-sm font-medium">Showcase your best work.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                append({
                  title: "",
                  techStack: "",
                  description: "",
                  githubUrl: "",
                  liveUrl: "",
                })
              }
              className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-5 py-3 rounded-xl font-bold transition text-xs uppercase tracking-wider"
            >
              <Plus size={16} />
              Add Project
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-zinc-900 bg-[#070707] rounded-2xl p-6 relative space-y-4">
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Project Title</label>
                    <input
                      {...register(`projects.${index}.title`)}
                      placeholder="e.g. Portfolio Website"
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Tech Stack (comma separated)</label>
                    <input
                      {...register(`projects.${index}.techStack`)}
                      placeholder="e.g. React, Next.js, Tailwind"
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">GitHub URL</label>
                    <input
                      {...register(`projects.${index}.githubUrl`)}
                      placeholder="https://github.com/..."
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Live Demo URL</label>
                    <input
                      {...register(`projects.${index}.liveUrl`)}
                      placeholder="https://project.com"
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={aiLoading[index]}
                      onClick={() => generateDescription(index)}
                      className="flex items-center gap-2 border border-zinc-850 bg-zinc-900 text-zinc-300 px-4 py-2 rounded-xl text-xs font-bold transition hover:bg-zinc-800"
                    >
                      <Sparkles size={14} />
                      {aiLoading[index] ? "Generating..." : "Generate AI Description"}
                    </button>
                  </div>

                  <textarea
                    rows={5}
                    {...register(`projects.${index}.description`)}
                    placeholder="Describe key features, challenges solved, and architectures..."
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                  />
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="flex justify-between pt-6 border-t border-zinc-900">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 px-5 py-3 border border-zinc-850 text-zinc-300 rounded-xl hover:bg-zinc-900 transition-colors text-xs font-bold uppercase tracking-wider"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <button
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold transition shadow-lg shadow-white/5 disabled:opacity-50 text-xs uppercase tracking-wider"
              >
                {isSubmitting ? "Saving..." : "Continue"}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
