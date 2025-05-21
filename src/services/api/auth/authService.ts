import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { AuthUser, AuthCheckResponse } from "@/types";

export const authService = {
  googleLogin: async (credential: string) => {
    return apiClient.post<{ User: AuthUser }>(
      API.AUTH.GOOGLE_LOGIN,
      { Credential: credential },
      { requiresAuth: false }
    );
  },

  logout: async () => {
    return apiClient.post(API.AUTH.LOGOUT, {}, { requiresAuth: true });
  },

  checkAuth: async () => {
    return apiClient.get<AuthCheckResponse>(API.AUTH.CHECK_AUTH, {
      requiresAuth: true,
    });
  },
};
