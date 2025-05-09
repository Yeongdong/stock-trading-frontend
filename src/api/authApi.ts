import { apiClient } from "@/services/apiClient";
import { API } from "@/constants";
import { LoginResponse } from "@/types/auth";

export const authApi = {
  googleLogin: async (credential: string) => {
    return apiClient.post<LoginResponse>(
      API.AUTH.GOOGLE_LOGIN,
      { Credential: credential },
      { requiresAuth: false }
    );
  },
};
