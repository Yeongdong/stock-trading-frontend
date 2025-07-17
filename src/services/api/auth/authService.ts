import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { ApiResponse } from "@/types/common/api";
import { AuthCheckResponse, GoogleLoginResponse } from "@/types";
import { tokenStorage } from "./tokenStorage";
import { AuthInitResult, RefreshTokenResponse } from "@/types/domains/auth";

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

    const trimmedCredential = credential.trim();
    if (trimmedCredential.split(".").length !== 3)
      return {
        status: 400,
        error: "유효하지 않은 인증 정보입니다.",
      };

    const response = await apiClient.post<GoogleLoginResponse>(
      API.AUTH.GOOGLE_LOGIN,
      { Credential: credential.trim() },
      { requiresAuth: false }
    );

    if (
      response.status === 200 &&
      response.data?.accessToken &&
      response.data?.expiresIn
    )
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
    const response = await apiClient.post<RefreshTokenResponse>(
      API.AUTH.REFRESH,
      {},
      { requiresAuth: false }
    );

    if (response.status === 200 && response.data?.accessToken) {
      const expiresIn = response.data.expiresIn || 3600;

      tokenStorage.setAccessToken(response.data.accessToken, expiresIn);
    }

    return response;
  },

  /**
   * 백그라운드에서 토큰 갱신
   */
  silentRefresh: async (): Promise<boolean> => {
    const response = await authService.refreshAccessToken();
    return response.status === 200 && Boolean(response.data?.accessToken);
  },

  /**
   * 페이지 로드 시 토큰 복구 시도
   * Refresh Token이 쿠키에 있으면 자동으로 Access Token 발급
   */
  initializeAuth: async (): Promise<AuthInitResult> => {
    // 이미 유효한 Access Token이 있으면 복구할 필요 없음
    const currentToken = tokenStorage.getAccessToken();
    if (currentToken && !tokenStorage.isAccessTokenExpiringSoon())
      return { success: true, needsLogin: false };

    // Refresh Token으로 새 Access Token 발급 시도
    const response = await authService.refreshAccessToken();

    if (response.status === 200 && response.data?.accessToken)
      return { success: true, needsLogin: false };

    // 401/403 에러는 Refresh Token 만료 -> 로그인 필요
    if (response.status === 401 || response.status === 403) {
      tokenStorage.clearAccessToken();
      return { success: false, needsLogin: true };
    }

    // 기타 에러는 네트워크 에러 등으로 재시도 가능
    tokenStorage.clearAccessToken();
    return { success: false, needsLogin: false };
  },
};
