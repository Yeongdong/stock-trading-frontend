"use client";

import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { CredentialResponse } from "@react-oauth/google";
import { STORAGE_KEYS, API, AUTH, ERROR_MESSAGES } from "@/constants";
import { LoginResponse } from "@/types";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/apiClient";

export default function LoginPage() {
  const { addError } = useError();

  useEffect(() => {
    // 세션이 만료된 후 리디렉션으로 돌아온 경우 메시지 표시
    const urlParams = new URLSearchParams(window.location.search);
    const sessionExpired = urlParams.get("sessionExpired");

    if (sessionExpired === "true") {
      addError({
        message: ERROR_MESSAGES.AUTH.SESSION_EXPIRED,
        severity: "warning",
      });
    }
  }, [addError]);

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      const response = await apiClient.post<LoginResponse>(
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

      sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.token);
      sessionStorage.setItem(STORAGE_KEYS.LOGIN_SUCCESS, "true");

      // 약간의 지연을 주어 세션 스토리지 저장을 보장
      await new Promise((resolve) => setTimeout(resolve, 100));

      addError({
        message: ERROR_MESSAGES.AUTH.LOGIN_SUCCESS,
        severity: "info",
      });

      if (!data.user.kisToken) {
        window.location.replace("/kis-token");
      } else {
        window.location.replace("/dashboard");
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
    <GoogleOAuthProvider clientId={AUTH.GOOGLE.CLIENT_ID}>
      <div>
        <h1>로그인</h1>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
