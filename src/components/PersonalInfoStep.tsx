"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, MapPin, Globe, ArrowRight } from "lucide-react";
import { getResumeById, updateResume } from "@/apis/resume.api";
import { IResume } from "@/types/resume.types";
import StepHeader from "./StepHeader";

const Github = ({ size = 18, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Linkedin = ({ size = 18, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
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

interface Props {
  resumeId: string;
  onNext: () => void;
}

interface PersonalInfoForm {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export default function PersonalInfoStep({ resumeId, onNext }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<PersonalInfoForm>();

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await getResumeById(resumeId);
        const resumeData = (response.data as { resume?: IResume } | undefined)?.resume;
        if (resumeData?.personalInfo) {
          reset({
            fullName: resumeData.personalInfo.fullname || "",
            email: resumeData.personalInfo.email || "",
            phone: resumeData.personalInfo.mobile || "",
            location: resumeData.personalInfo.location || "",
            github: resumeData.personalInfo.github || "",
            linkedin: resumeData.personalInfo.linkedIn || "",
            portfolio: resumeData.personalInfo.portfolio || "",
          });
        }
      } catch (error) {
        console.error("Error fetching personal info", error);
      }
    };
    fetchResume();
  }, [resumeId, reset]);

  const onSubmit = async (values: PersonalInfoForm) => {
    try {
      await updateResume(resumeId, {
        personalInfo: {
          fullname: values.fullName,
          email: values.email,
          mobile: values.phone,
          location: values.location,
          github: values.github,
          linkedIn: values.linkedin,
          portfolio: values.portfolio,
        },
      });
      onNext();
    } catch (error) {
      console.error("Error saving personal info", error);
    }
  };

  return (
    <div className="min-h-screen bg-black py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <StepHeader step={1} />

        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Personal Information
            </h1>
            <p className="text-zinc-400 mt-2 text-sm font-medium">
              Tell recruiters how they can reach you.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <InputField
                icon={<User size={18} />}
                placeholder="John Doe"
                label="Full Name"
                register={register("fullName")}
              />

              <InputField
                icon={<Mail size={18} />}
                placeholder="john@example.com"
                label="Email"
                register={register("email")}
              />

              <InputField
                icon={<Phone size={18} />}
                placeholder="+1 (555) 000-0000"
                label="Phone Number"
                register={register("phone")}
              />

              <InputField
                icon={<MapPin size={18} />}
                placeholder="San Francisco, CA"
                label="Location"
                register={register("location")}
              />

              <InputField
                icon={<Linkedin size={18} />}
                placeholder="LinkedIn Profile Name"
                label="LinkedIn Username"
                register={register("linkedin")}
              />

              <InputField
                icon={<Github size={18} />}
                placeholder="GitHub Username"
                label="GitHub Username"
                register={register("github")}
              />

              <div className="md:col-span-2">
                <InputField
                  icon={<Globe size={18} />}
                  placeholder="https://portfolio.com"
                  label="Portfolio Link"
                  register={register("portfolio")}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-900">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-white/5 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Continue"}
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  register: Record<string, unknown>;
}

function InputField({ label, placeholder, icon, register }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
          {icon}
        </div>
        <input
          {...register}
          placeholder={placeholder}
          className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white text-sm placeholder:text-zinc-650 focus:outline-none focus:border-zinc-500 transition-colors"
        />
      </div>
    </div>
  );
}
