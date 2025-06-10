import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { ApiResponse } from "@/types/api/common";
import { AuthCheckResponse, GoogleLoginResponse } from "@/types";

export const authService = {
  googleLogin: async (
    credential: string
  ): Promise<ApiResponse<GoogleLoginResponse>> => {
    return apiClient.post<GoogleLoginResponse>(
      API.AUTH.GOOGLE_LOGIN,
      { Credential: credential },
      { requiresAuth: false }
    );
  },

  logout: async (): Promise<ApiResponse> => {
    return apiClient.post(API.AUTH.LOGOUT, {}, { requiresAuth: true });
  },

  checkAuth: async (): Promise<ApiResponse<AuthCheckResponse>> => {
    return apiClient.get<AuthCheckResponse>(API.AUTH.CHECK_AUTH, {
      requiresAuth: true,
    });
  },
};
