"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { GraduationCap, Plus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { getResumeById, updateResume } from "@/apis/resume.api";
import { IResume, IEducation } from "@/types/resume.types";
import StepHeader from "./StepHeader";

interface Props {
  resumeId: string;
  onNext: () => void;
  onBack: () => void;
}

interface EducationForm {
  education: {
    institute: string;
    degree: string;
    startDate: string;
    endDate: string;
  }[];
}

export default function EducationStep({ resumeId, onNext, onBack }: Props) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EducationForm>({
    defaultValues: {
      education: [
        {
          institute: "",
          degree: "",
          startDate: "",
          endDate: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await getResumeById(resumeId);
        const resumeData = (response.data as { resume?: IResume } | undefined)?.resume;
        if (resumeData?.education && resumeData.education.length > 0) {
          reset({
            education: resumeData.education.map((edu: IEducation) => ({
              institute: edu.institute || "",
              degree: edu.degree || "",
              startDate: edu.startDate || "",
              endDate: edu.endDate || "",
            })),
          });
        }
      } catch (error) {
        console.error("Error fetching education", error);
      }
    };
    fetchResume();
  }, [resumeId, reset]);

  const onSubmit = async (values: EducationForm) => {
    try {
      await updateResume(resumeId, {
        education: values.education,
      });
      onNext();
    } catch (error) {
      console.error("Error saving education", error);
    }
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <StepHeader step={2} />

        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
              <GraduationCap className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Education
              </h1>
              <p className="text-zinc-400 mt-1 text-sm font-medium">
                Add your educational background.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-zinc-900 bg-[#070707] rounded-2xl p-6 relative space-y-4"
              >
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Institute
                    </label>
                    <input
                      {...register(`education.${index}.institute`)}
                      placeholder="University or High School Name"
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Degree
                    </label>
                    <input
                      {...register(`education.${index}.degree`)}
                      placeholder="e.g. B.S. Computer Science"
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Start Date
                    </label>
                    <input
                      type="date"
                      {...register(`education.${index}.startDate`)}
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors scheme-dark"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      End Date
                    </label>
                    <input
                      type="date"
                      {...register(`education.${index}.endDate`)}
                      className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-zinc-500 transition-colors scheme-dark"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                append({
                  institute: "",
                  degree: "",
                  startDate: "",
                  endDate: "",
                })
              }
              className="flex items-center gap-2 border border-zinc-850 text-zinc-300 px-5 py-3 rounded-xl hover:bg-zinc-900 transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <Plus size={16} />
              Add Education
            </button>

            <div className="flex justify-between pt-6 border-t border-zinc-900 mt-8">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 px-5 py-3 border border-zinc-850 text-zinc-300 rounded-xl hover:bg-zinc-900 transition-colors text-xs font-bold uppercase tracking-wider"
              >
                <ArrowLeft size={16} />
                Back
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold transition shadow-lg shadow-white/5 disabled:opacity-50"
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
