import api from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import {
  GenerateSummaryBody,
  GenerateSkillsBody,
  GenerateProjectDescriptionBody,
  GenerateExperienceDescriptionBody,
  ImproveContentBody,
  AtsScoreBody,
} from "@/types/ai.types";

export const generateSummary = async (data: GenerateSummaryBody): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/ai/generate-summary", data);
  return response.data;
};

export const generateSkills = async (data: GenerateSkillsBody): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/ai/generate-skills", data);
  return response.data;
};

export const generateProjectDescription = async (data: GenerateProjectDescriptionBody): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/ai/generate-project-description", data);
  return response.data;
};

export const generateExperienceDescription = async (data: GenerateExperienceDescriptionBody): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/ai/generate-expericence-description", data);
  return response.data;
};

export const improveContent = async (data: ImproveContentBody): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/ai/improve-content", data);
  return response.data;
};

export const calculateAtsScore = async (data: AtsScoreBody): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/ai/ats-score", data);
  return response.data;
};
