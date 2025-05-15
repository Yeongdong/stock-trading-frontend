"use client";

import { useEffect, useState } from "react";
import { API, STORAGE_KEYS, ERROR_MESSAGES } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import KisTokenForm from "@/components/features/account/KisTokenForm";
import { redirect } from "next/navigation";
import { User } from "@/types";

export default function KisTokenPage() {
  const [user, setUser] = useState<User | null>(null);
  const { addError } = useError();

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (!accessToken) {
        redirect("/login");
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get<User>(API.USER.GET_CURRENT);

        if (response.error) {
          addError({
            message: ERROR_MESSAGES.USER.FETCH_FAILED,
            severity: "error",
          });
          redirect("/login");
          return;
        }

        setUser(response.data!);
      } catch (error) {
        console.error("Error fetching user data:", error);
        addError({
          message: ERROR_MESSAGES.USER.FETCH_FAILED,
          severity: "error",
        });
      }
    };

    fetchUserData();
  }, [addError]);

  return <KisTokenForm userId={user?.id} />;
}
