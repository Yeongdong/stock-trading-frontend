import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { ApiResponse } from "@/types/common/api";
import { AuthCheckResponse, GoogleLoginResponse } from "@/types";

/**
 * 인증 관련 API 서비스
 */
export const authService = {
  /**
   * Google OAuth 로그인
   */
  googleLogin: async (
    credential: string
  ): Promise<ApiResponse<GoogleLoginResponse>> => {
    if (!credential || credential.trim().length === 0)
      return {
        status: 400,
        error: "인증 정보가 필요합니다.",
      };

    return apiClient.post<GoogleLoginResponse>(
      API.AUTH.GOOGLE_LOGIN,
      { Credential: credential.trim() },
      { requiresAuth: false }
    );
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<ApiResponse> => {
    return apiClient.post(API.AUTH.LOGOUT, {}, { requiresAuth: true });
  },

  /**
   * 인증 상태 확인
   */
  checkAuth: async (): Promise<ApiResponse<AuthCheckResponse>> => {
    return apiClient.get<AuthCheckResponse>(API.AUTH.CHECK_AUTH, {
      requiresAuth: false,
    });
  },
};
