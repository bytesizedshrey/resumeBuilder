"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Mail, Lock, User, Phone, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { registerUser } from "@/apis/auth.api";
import { RegisterBody } from "@/types/user.types";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let toastIdCounter = 0;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterBody>();

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = String(++toastIdCounter);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const onSubmit = async (data: RegisterBody) => {
    setIsLoading(true);
    try {
      const response = await registerUser(data);
      if (response.success) {
        showToast(response.message || "Registration successful! Redirecting...", "success");
        localStorage.setItem("user", JSON.stringify(response.data || {}));
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        showToast(response.message || "Failed to register.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Registration failed. Entering offline sandbox mode.", "info");
      // Fallback local storage for sandbox
      localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email }));
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#000000] text-slate-100 flex flex-col justify-center items-center px-4 font-sans overflow-hidden select-none">
      {/* Background glowing gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-white/[0.015] blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-white/[0.015] blur-[180px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-8 md:p-10 rounded-3xl relative shadow-2xl backdrop-blur-md z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg group-hover:scale-105 transition">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Briefly
            </span>
          </Link>
          <h2 className="text-2xl font-black mb-1 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Get started with AI-powered resume building
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-mono text-xs">
          
          {/* Full Name */}
          <div>
            <label className="text-slate-400 block mb-1">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                {...register("name", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-zinc-500 transition text-slate-200 text-sm font-sans"
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <span className="text-red-400 text-[10px] mt-1 block">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-slate-400 block mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                {...register("email", {
                  required: "Email address is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-zinc-500 transition text-slate-200 text-sm font-sans"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <span className="text-red-400 text-[10px] mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-slate-400 block mb-1">Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                {...register("mobile", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  },
                })}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-zinc-500 transition text-slate-200 text-sm font-sans"
                placeholder="9876543210"
              />
            </div>
            {errors.mobile && (
              <span className="text-red-400 text-[10px] mt-1 block">
                {errors.mobile.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-zinc-500 transition text-slate-200 text-sm font-sans"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <span className="text-red-400 text-[10px] mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs tracking-wider transition-all duration-300 mt-6 shadow-lg shadow-white/5 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              "CREATING ACCOUNT..."
            ) : (
              <>
                REGISTER
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8 text-xs text-slate-400 font-sans">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-white hover:text-zinc-300 font-semibold underline underline-offset-4">
            Sign In Here
          </Link>
        </div>

      </div>

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
