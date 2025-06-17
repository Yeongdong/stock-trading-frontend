"use client";

import { useEffect, useState } from "react";
import { API, ERROR_MESSAGES } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import KisTokenForm from "@/components/features/account/KisTokenForm";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import { useRouter } from "next/navigation";
import { User } from "@/types/user/user";

export default function KisTokenPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addError } = useError();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const response = await apiClient.get<User>(API.USER.GET_CURRENT);

        if (!isMounted) return;

        if (response.error) {
          addError({
            message: ERROR_MESSAGES.USER.FETCH_FAILED,
            severity: "error",
          });
          router.push("/login");
          return;
        }

        setUser(response.data!);
      } catch (error) {
        if (!isMounted) return;

        console.error("사용자 정보 조회 실패:", error);
        addError({
          message: ERROR_MESSAGES.USER.FETCH_FAILED,
          severity: "error",
        });
        router.push("/login");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [addError, router]);

  if (isLoading) {
    return <LoadingIndicator message="사용자 정보를 불러오는 중..." />;
  }

  return <KisTokenForm userId={user?.id} />;
}
