import api from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { IResume } from "@/types/resume.types";

interface ResumeMetadata {
  _id: string;
  title: string;
  jobTitle: string;
  experienceLevel: string;
}

// Local storage helpers to manage list/delete on the client-side
const getLocalResumes = (): ResumeMetadata[] => {
  if (typeof window === "undefined") return [];
  const list = localStorage.getItem("resume_builder_metadata");
  return list ? JSON.parse(list) : [];
};

const saveLocalResumes = (list: ResumeMetadata[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("resume_builder_metadata", JSON.stringify(list));
};

export const getAllResumesApi = async (): Promise<{ resumes: ResumeMetadata[] }> => {
  const localList = getLocalResumes();
  return { resumes: localList };
};

export const createResumeApi = async (payload: {
  title: string;
  jobTitle: string;
  experienceLevel: string;
}): Promise<ApiResponse> => {
  // 1. Create a blank resume in the database
  const createRes = await api.post<ApiResponse>("/resume/create");
  const newResume = (createRes.data?.data as Record<string, unknown> | undefined)?.resume as { _id?: string } | undefined;

  if (!newResume || !newResume._id) {
    throw new Error("Failed to initialize resume in backend.");
  }

  const resumeId = newResume._id;

  // 2. Set the initial title and fields in the backend using PATCH
  const updateRes = await api.patch<ApiResponse>(`/resume/${resumeId}`, {
    title: payload.title,
    summary: "",
    personalInfo: {
      fullname: "",
      email: "",
      mobile: "",
      location: "",
      github: "",
      portfolio: "",
    },
    workExperience: [],
    projects: [],
    education: [],
    certifications: [],
  });

  // 3. Save metadata to client-side list
  const localList = getLocalResumes();
  const metadata: ResumeMetadata = {
    _id: resumeId,
    title: payload.title,
    jobTitle: payload.jobTitle,
    experienceLevel: payload.experienceLevel,
  };
  saveLocalResumes([...localList, metadata]);

  return updateRes.data;
};

// Alias for backwards compatibility with page.tsx
export const createResume = async (): Promise<ApiResponse> => {
  return createResumeApi({
    title: "Untitled Resume",
    jobTitle: "Software Engineer",
    experienceLevel: "Fresher",
  });
};

export const deleteResumeApi = async (resumeId: string): Promise<ApiResponse> => {
  // Update local metadata list
  const localList = getLocalResumes();
  saveLocalResumes(localList.filter((r) => r._id !== resumeId));

  return {
    success: true,
    message: "Resume metadata deleted from list.",
  };
};

export const getResumeById = async (resumeId: string): Promise<ApiResponse> => {
  const response = await api.get<ApiResponse>(`/resume/${resumeId}`);
  return response.data;
};

export const updateResume = async (resumeId: string, data: Partial<IResume>): Promise<ApiResponse> => {
  const response = await api.patch<ApiResponse>(`/resume/${resumeId}`, data);
  return response.data;
};
