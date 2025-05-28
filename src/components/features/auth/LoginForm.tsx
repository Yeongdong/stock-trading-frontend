import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import { API, ERROR_MESSAGES } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import { useRouter } from "next/navigation";
import { GoogleLoginResponse } from "@/types/auth/auth";
import { AuthUser } from "@/types";

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

      if (response.error) {
        throw new Error(response.error);
      }

      const data = response.data!;

      if (hasValidKisToken(data.user)) {
        router.push("/dashboard");
      } else {
        router.push("/kis-token");
      }
    } catch (error) {
      console.error("Login error:", error);
      addError({
        message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
        severity: "error",
      });
    }
  };

  const hasValidKisToken = (user: AuthUser): boolean => {
    if (!user?.kisToken) {
      return false;
    }

    if (!user.kisToken.accessToken || user.kisToken.accessToken.trim() === "") {
      return false;
    }

    if (user.kisToken.expiresIn) {
      try {
        const expiresAt = new Date(user.kisToken.expiresIn);
        const now = new Date();

        if (expiresAt <= now) {
          addError({
            message: ERROR_MESSAGES.KIS_TOKEN.TOKEN_EXPIRED,
            severity: "warning",
          });
          return false;
        }
      } catch (error) {
        console.warn("토큰 만료 시간 파싱 실패:", error);
      }
    }

    return true;
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
