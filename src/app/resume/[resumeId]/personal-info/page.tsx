"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function PersonalInfoRedirectPage() {
  const router = useRouter();
  const { resumeId } = useParams();

  useEffect(() => {
    router.replace(`/resume/${resumeId}`);
  }, [resumeId, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs">
      Redirecting to Resume Builder Step 1...
    </div>
  );
}
