"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingIndicator from "./LoadingIndicator";
import { AuthGuardProps } from "@/types";
import { useAuthContext } from "@/contexts/AuthContext";

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?sessionExpired=true");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingIndicator message="인증 상태 확인 중..." />;
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default AuthGuard;
