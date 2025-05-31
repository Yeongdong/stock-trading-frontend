"use client";

import { useEffect } from "react";
import { useError } from "@/contexts/ErrorContext";
import { ERROR_MESSAGES } from "@/constants/errors";
import LoginForm from "@/components/features/auth/LoginForm";

export default function LoginPage() {
  const { addError } = useError();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionExpired = urlParams.get("sessionExpired");

    if (sessionExpired === "true") {
      addError({
        message: ERROR_MESSAGES.AUTH.SESSION_EXPIRED,
        severity: "warning",
      });
    }
  }, [addError]);

  return <LoginForm />;
}
