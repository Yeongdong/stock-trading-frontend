import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import { API, ERROR_MESSAGES } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import { userService } from "@/services/api/user/userService";
import { useRouter } from "next/navigation";
import { GoogleLoginResponse } from "@/types/auth/auth";
import { AuthUser } from "@/types/user/user";

enum TokenStatus {
  VALID = "valid",
  MISSING = "missing",
  EXPIRED = "expired",
  INVALID = "invalid",
}

const LoginForm = () => {
  const { addError } = useError();
  const router = useRouter();

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      const response = await apiClient.post<GoogleLoginResponse>(
        API.AUTH.GOOGLE_LOGIN,
        {
          Credential: credentialResponse.credential,
        },
        { requiresAuth: false }
      );

      if (response.error) throw new Error(response.error);

      const data = response.data!;
      const tokenStatus = getTokenStatus(data.user);

      switch (tokenStatus) {
        case TokenStatus.VALID:
          router.push("/dashboard");
          break;

        case TokenStatus.EXPIRED:
          await handleExpiredToken(data.user);
          break;

        case TokenStatus.MISSING:
        case TokenStatus.INVALID:
          router.push("/kis-token");
          break;
      }
    } catch (error) {
      console.error("Login error:", error);
      addError({
        message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
        severity: "error",
      });
    }
  };

  const getTokenStatus = (user: AuthUser): TokenStatus => {
    if (!user?.kisToken) return TokenStatus.MISSING;

    if (!user.kisToken.accessToken || user.kisToken.accessToken.trim() === "")
      return TokenStatus.INVALID;

    if (user.kisToken.expiresIn) {
      try {
        const expiresAt = new Date(user.kisToken.expiresIn);
        const now = new Date();

        if (expiresAt <= now) return TokenStatus.EXPIRED;
      } catch (error) {
        console.warn("토큰 만료 시간 파싱 실패:", error);
        return TokenStatus.INVALID;
      }
    }

    return TokenStatus.VALID;
  };

  const handleExpiredToken = async (user: AuthUser) => {
    if (!user.kisAppKey || !user.kisAppSecret || !user.accountNumber) {
      addError({
        message:
          "KIS API 정보가 설정되지 않았습니다. 설정 페이지로 이동합니다.",
        severity: "warning",
      });
      router.push("/kis-token");
      return;
    }

    try {
      await refreshKisToken(
        user.kisAppKey,
        user.kisAppSecret,
        user.accountNumber
      );
      router.push("/dashboard");
    } catch (error) {
      console.error("토큰 갱신 실패:", error);
      addError({
        message: "토큰 갱신에 실패했습니다. 설정을 확인해주세요.",
        severity: "error",
      });
      router.push("/kis-token");
    }
  };

  const refreshKisToken = async (
    appKey: string,
    appSecret: string,
    accountNumber: string
  ) => {
    try {
      const response = await userService.refreshKisToken(
        appKey,
        appSecret,
        accountNumber
      );
      return response;
    } catch (error) {
      console.error("토큰 갱신 중 오류 발생:", error);
      throw error;
    }
  };

  const handleGoogleError = () => {
    addError({
      message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
      severity: "error",
    });
  };

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
    >
      <div>
        <h1>로그인</h1>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginForm;
