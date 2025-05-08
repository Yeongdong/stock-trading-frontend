"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { CredentialResponse } from "@react-oauth/google";
import { STORAGE_KEYS, API, AUTH } from "@/constants";

export default function LoginPage() {
  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      const response = await fetch(API.AUTH.GOOGLE_LOGIN, {
        method: "POST",
        headers: {
          "CONTENT-TYPE": "application/json",
        },
        body: JSON.stringify({
          Credential: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.token);
      sessionStorage.setItem(STORAGE_KEYS.LOGIN_SUCCESS, "true");

      // 약간의 지연을 주어 세션 스토리지 저장을 보장
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!data.user.kisToken) {
        window.location.replace("/kis-token");
      } else {
        window.location.replace("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  return (
    <GoogleOAuthProvider clientId={AUTH.GOOGLE.CLIENT_ID}>
      <div>
        <h1>로그인</h1>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
