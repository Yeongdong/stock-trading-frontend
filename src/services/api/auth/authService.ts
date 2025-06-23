import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { ApiResponse } from "@/types/common/api";
import { AuthCheckResponse, GoogleLoginResponse } from "@/types";
import { tokenStorage } from "./tokenStorage";

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
    if (!credential?.trim())
      return {
        status: 400,
        error: "인증 정보가 필요합니다.",
      };

    const response = await apiClient.post<GoogleLoginResponse>(
      API.AUTH.GOOGLE_LOGIN,
      { Credential: credential.trim() },
      { requiresAuth: false }
    );

    if (response.data?.accessToken && response.data?.expiresIn)
      tokenStorage.setAccessToken(
        response.data.accessToken,
        response.data.expiresIn
      );

    return response;
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post(
      API.AUTH.LOGOUT,
      {},
      { requiresAuth: true }
    );

    tokenStorage.clearAccessToken();

    return response;
  },

  /**
   * 인증 상태 확인
   */
  checkAuth: async (): Promise<ApiResponse<AuthCheckResponse>> => {
    return apiClient.get<AuthCheckResponse>(API.AUTH.CHECK_AUTH, {
      requiresAuth: true,
    });
  },

  /**
   * 토큰 갱신
   */
  refreshAccessToken: async (): Promise<
    ApiResponse<{ accessToken: string; expiresIn: number }>
  > => {
    const response = await apiClient.post<{
      accessToken: string;
      expiresIn: number;
    }>(API.AUTH.REFRESH, {}, { requiresAuth: false });

    if (response.data?.accessToken && response.data?.expiresIn)
      tokenStorage.setAccessToken(
        response.data.accessToken,
        response.data.expiresIn
      );

    return response;
  },

  /**
   * 백그라운드에서 토큰 갱신
   */
  silentRefresh: async (): Promise<boolean> => {
    try {
      const response = await authService.refreshAccessToken();
      return response.status === 200 && !!response.data;
    } catch {
      tokenStorage.clearAccessToken();
      return false;
    }
  },
};
