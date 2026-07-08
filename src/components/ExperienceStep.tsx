"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, ArrowRight, Plus, Trash2, Sparkles, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { getResumeById, updateResume } from "@/apis/resume.api";
import { generateExperienceDescription } from "@/apis/ai.api";
import { IResume, IWorkExperience } from "@/types/resume.types";
import StepHeader from "./StepHeader";

interface Props {
  resumeId: string;
  onNext: () => void;
  onBack: () => void;
}

interface ExperienceItem {
  company: string;
  position: string; // Map role to position to match backend DB schema
  startDate: string;
  endDate: string;
  desciption: string; // Map description to desciption to match backend DB schema
}

interface FormValues {
  experience: ExperienceItem[];
}

export default function ExperienceStep({ resumeId, onBack }: Props) {
  const router = useRouter();
  const [aiLoading, setAiLoading] = useState<Record<number, boolean>>({});

  const {
    register,
    control,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      experience: [
        {
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          desciption: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await getResumeById(resumeId);
        const resume = (response.data as { resume?: IResume } | undefined)?.resume;

        if (resume?.workExperience?.length) {
          reset({
            experience: resume.workExperience.map((exp: IWorkExperience) => ({
              company: exp.company || "",
              position: exp.position || "",
              startDate: exp.startDate || "",
              endDate: exp.endDate || "",
              desciption: exp.desciption || "",
            })),
          });
        }
      } catch (error) {
        console.error("Error fetching experience", error);
      }
    };
    fetchResume();
  }, [resumeId, reset]);

  const generateDescription = async (index: number) => {
    try {
      setAiLoading((prev) => ({ ...prev, [index]: true }));
      const exp = watch(`experience.${index}`);

      const aiResponse = await generateExperienceDescription({
        company: exp.company || "Company",
        position: exp.position || "Software Engineer",
      });

      if (aiResponse.success && (aiResponse.data as { experienceDescription?: string } | undefined)?.experienceDescription) {
        setValue(`experience.${index}.desciption`, (aiResponse.data as { experienceDescription: string }).experienceDescription);
      }
    } catch (error) {
      console.error("Error generating experience description", error);
    } finally {
      setAiLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await updateResume(resumeId, {
        workExperience: values.experience,
      });

      router.push(`/resume/${resumeId}/preview`);
    } catch (error) {
      console.error("Error saving experience", error);
    }
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <StepHeader step={5} />

        <div className="bg-zinc-950 p-8 rounded-3xl border border-zinc-900 shadow-2xl">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                <Briefcase className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Work Experience</h1>
                <p className="text-zinc-400 mt-1 text-sm font-medium">
                  Showcase your professional experience.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                append({
                  company: "",
                  position: "",
                  startDate: "",
                  endDate: "",
                  desciption: "",
                })
              }
              className="bg-white hover:bg-zinc-200 text-black px-5 py-3 rounded-xl font-bold transition text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Plus size={16} />
              Add Experience
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Company Name</label>
                    <input
                      {...register(`experience.${index}.company`)}
                      placeholder="e.g. Google"
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Job Title / Role</label>
                    <input
                      {...register(`experience.${index}.position`)}
                      placeholder="e.g. Software Engineer"
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Start Date</label>
                    <input
                      type="date"
                      {...register(`experience.${index}.startDate`)}
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors scheme-dark"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">End Date</label>
                    <input
                      type="date"
                      {...register(`experience.${index}.endDate`)}
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors scheme-dark"
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={aiLoading[index]}
                      onClick={() => generateDescription(index)}
                      className="bg-zinc-900 border border-zinc-850 text-zinc-300 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-zinc-800 transition-colors"
                    >
                      <Sparkles size={14} />
                      {aiLoading[index] ? "Generating..." : "Generate AI Description"}
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    {...register(`experience.${index}.desciption`)}
                    placeholder="Describe your responsibilities, impact, and projects you owned..."
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                  />
                </div>
              </div>
            ))}

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
