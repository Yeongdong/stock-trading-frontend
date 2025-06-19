import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import LoadingIndicator from "./LoadingIndicator";
import { AuthGuardProps } from "@/types";

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  redirectPath = "/login",
  loadingMessage = "인증 상태 확인 중...",
}) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, isLoading, router, redirectPath]);

  if (isLoading) {
    return <LoadingIndicator message={loadingMessage} />;
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default AuthGuard;
