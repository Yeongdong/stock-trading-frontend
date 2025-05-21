import {
  GoogleOAuthProvider,
  GoogleLogin,
  CredentialResponse,
} from "@react-oauth/google";
import { API, ERROR_MESSAGES } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import { useRouter } from "next/router";
import { GoogleLoginResponse } from "@/types/auth/auth";

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

      addError({
        message: ERROR_MESSAGES.AUTH.LOGIN_SUCCESS,
        severity: "info",
      });

      if (!data.User.kisToken) {
        router.push("/kis-token");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      addError({
        message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
        severity: "error",
      });
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
