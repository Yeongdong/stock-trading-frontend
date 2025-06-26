"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API, ERROR_MESSAGES } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import UserProfileContent from "@/components/features/user/UserProfileContent";
import { AuthUser } from "@/types";
import styles from "./page.module.css";

export default function UserProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { addError } = useError();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await apiClient.get<AuthUser>(API.USER.GET_CURRENT);

      if (response.error) {
        addError({
          message: ERROR_MESSAGES.USER.FETCH_FAILED,
          severity: "error",
        });
        router.push("/login");
        return;
      }

      setUser(response.data!);
      setIsLoading(false);
    };

    fetchUserData();
  }, [addError, router]);

  if (isLoading)
    return <LoadingIndicator message="사용자 정보를 불러오는 중..." />;

  if (!user) return null;

  return (
    <div className={styles.container}>
      <h1>사용자 정보 관리</h1>

      <div className={styles.content}>
        <UserProfileContent user={user} />
      </div>
    </div>
  );
}
