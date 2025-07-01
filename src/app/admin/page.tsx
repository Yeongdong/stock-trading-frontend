"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { tokenStorage } from "@/services/api/auth/tokenStorage";
import { GoogleLoginResponse } from "@/types";

export default function AdminAutoLogin() {
  const router = useRouter();

  useEffect(() => {
    const autoLogin = async () => {
      const response = await apiClient.post<GoogleLoginResponse>(
        API.AUTH.MASTER,
        {
          requiresAuth: false,
        }
      );

      if (response.error) {
        router.push("/login");
        return;
      }

      if (response.data?.accessToken)
        tokenStorage.setAccessToken(
          response.data.accessToken,
          response.data.expiresIn
        );

      router.push("/dashboard");
    };

    autoLogin();
  }, [router]);

  return <div>마스터 로그인 중...</div>;
}
