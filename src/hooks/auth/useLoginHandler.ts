import { useCallback } from "react";
import { CredentialResponse } from "@react-oauth/google";
import { authService } from "@/services/api/auth/authService";
import { tokenStorage } from "@/services/api/auth/tokenStorage";
import { useError } from "@/contexts/ErrorContext";
import { AuthUser } from "@/types";
import { ErrorService } from "@/services/error/errorService";

export const useLoginHandler = () => {
  const { addError } = useError();

  const handleGoogleLogin = useCallback(
    async (credentialResponse: CredentialResponse) => {
      if (!credentialResponse.credential) {
        addError({
          message: "인증 정보가 없습니다.",
          severity: "error",
        });
        return { success: false };
      }

      const response = await authService.googleLogin(
        credentialResponse.credential
      );

      if (response.error) {
        const standardError = ErrorService.standardize(response.error);
        addError({
          message: standardError.message,
          code: standardError.code,
          severity: standardError.severity,
        });
        return { success: false };
      }

      const { data } = response;
      if (!data?.user) {
        addError({
          message: "사용자 정보를 가져올 수 없습니다.",
          severity: "error",
        });
        return { success: false };
      }

      // JWT 액세스 토큰 저장
      if (data.accessToken)
        tokenStorage.setAccessToken(data.accessToken, data.expiresIn);

      const redirectTo = determineRedirectPath(data.user);

      return { success: true, redirectTo, user: data.user };
    },
    [addError]
  );

  const determineRedirectPath = (user: AuthUser): string => {
    if (!user.kisAppKey || !user.kisAppSecret || !user.accountNumber)
      return "/kis-token";

    return "/dashboard";
  };

  return {
    handleGoogleLogin,
  };
};
