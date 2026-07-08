import api from "@/lib/axios";
import { RegisterBody, LoginBody } from "@/types/user.types";
import { ApiResponse } from "@/types/api.types";

export const registerUser = async (data: RegisterBody): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/auth/register", data);
  return response.data;
};

export const loginUser = async (data: LoginBody): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/auth/login", data);
  return response.data;
};
