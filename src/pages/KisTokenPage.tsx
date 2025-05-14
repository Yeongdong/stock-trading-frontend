"use client";

import { useEffect, useState } from "react";
import { API, ERROR_MESSAGES } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import KisTokenForm from "@/components/features/account/KisTokenForm";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  accountNumber: string;
}

export default function KisToken() {
  const [user, setUser] = useState<User | null>(null);
  const { addError } = useError();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get<User>(API.USER.GET_CURRENT);

        if (response.error) {
          addError({
            message: ERROR_MESSAGES.USER.FETCH_FAILED,
            severity: "error",
          });
          window.location.href = "/login";
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
