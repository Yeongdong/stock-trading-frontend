import { useEffect } from "react";
import { useError } from "@/contexts/ErrorContext";
import { ERROR_MESSAGES } from "@/constants/errors";
import LoginForm from "@/components/features/auth/LoginForm";

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

  return <LoginForm />;
}
