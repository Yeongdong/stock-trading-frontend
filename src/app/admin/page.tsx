"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";

export default function AdminAutoLogin() {
  const router = useRouter();

  useEffect(() => {
    const autoLogin = async () => {
      const response = await apiClient.post(
        API.AUTH.MASTER,
        {
          secret: process.env.NEXT_PUBLIC_MASTER_SECRET,
        },
        { requiresAuth: false }
      );

      if (response.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
    };

    autoLogin();
  }, [router]);

  return <div>마스터 로그인 중...</div>;
}
