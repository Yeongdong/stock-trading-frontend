import { useCallback } from "react";
import { CredentialResponse } from "@react-oauth/google";
import { API } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import { useAuthToken } from "./useAuthToken";
import { tokenStorage } from "@/services/api/auth/tokenStorage";
import {
  AuthUser,
  GoogleLoginResponse,
  LoginResult,
  TokenStatus,
} from "@/types";
import { ErrorService } from "@/services/error/errorService";

export const useLoginHandler = () => {
  const { addError } = useError();
  const { getTokenStatus, refreshToken, isValidKisConfig } = useAuthToken();

  const handleExpiredToken = useCallback(
    async (user: AuthUser): Promise<LoginResult> => {
      if (!isValidKisConfig(user)) {
        addError({
          message:
            "KIS API 정보가 설정되지 않았습니다. 설정 페이지로 이동합니다.",
          severity: "warning",
        });
        return { success: true, redirectTo: "/kis-token", user };
      }

      try {
        await refreshToken(
          user.kisAppKey!,
          user.kisAppSecret!,
          user.accountNumber!
        );
        return { success: true, redirectTo: "/dashboard", user };
      } catch (error) {
        const standardError = ErrorService.standardize(error);

        addError({
          message: standardError.message,
          code: standardError.code,
          severity: standardError.severity,
        });

        return { success: true, redirectTo: "/kis-token", user };
      }
    },
    [refreshToken, isValidKisConfig, addError]
  );

  const handleGoogleLogin = useCallback(
    async (credentialResponse: CredentialResponse): Promise<LoginResult> => {
      try {
        const response = await apiClient.post<GoogleLoginResponse>(
          API.AUTH.GOOGLE_LOGIN,
          {
            Credential: credentialResponse.credential,
          },
          { requiresAuth: false }
        );

        if (response.error) return { success: false };

        const data = response.data!;

        // JWT 액세스 토큰
        if (data.accessToken)
          tokenStorage.setAccessToken(data.accessToken, data.expiresIn);

        const tokenStatus = getTokenStatus(data.user);

        switch (tokenStatus) {
          case TokenStatus.VALID:
            return { success: true, redirectTo: "/dashboard", user: data.user };

          case TokenStatus.EXPIRED:
            return await handleExpiredToken(data.user);

          case TokenStatus.MISSING:
          case TokenStatus.INVALID:
            return { success: true, redirectTo: "/kis-token", user: data.user };

          default:
            return { success: true, redirectTo: "/kis-token", user: data.user };
        }
      } catch (error) {
        const standardError = ErrorService.standardize(error);

        addError({
          message: standardError.message,
          code: standardError.code,
          severity: standardError.severity,
        });

        return { success: false };
      }
    },
    [getTokenStatus, addError, handleExpiredToken]
  );

  return {
    handleGoogleLogin,
  };
};
