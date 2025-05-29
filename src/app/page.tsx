"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/api";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const response = await authService.checkAuth();

        if (response.error || !response.data?.isAuthenticated) {
          router.replace("/login");
        } else {
          router.replace("/dashboard");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        router.replace("/login");
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  return null;
}
