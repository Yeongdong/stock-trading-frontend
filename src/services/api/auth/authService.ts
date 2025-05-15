import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { LoginResponse } from "@/types";

export const authService = {
  googleLogin: async (credential: string) => {
    return apiClient.post<LoginResponse>(
      API.AUTH.GOOGLE_LOGIN,
      { Credential: credential },
      { requiresAuth: false }
    );
  },
};
