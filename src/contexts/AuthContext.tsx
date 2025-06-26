"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import { useRouter } from "next/navigation";
import { useError } from "./ErrorContext";
import { ERROR_MESSAGES } from "@/constants";
import { ERROR_CODES } from "@/types/common/error";
import { authService } from "@/services/api/auth/authService";
import { tokenStorage } from "@/services/api/auth/tokenStorage";
import { AuthUser } from "@/types";
import { AuthContextType } from "@/types/domains/auth/context";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();
  const { addError } = useError();

  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      const currentToken = tokenStorage.getAccessToken();

      if (!currentToken || tokenStorage.isAccessTokenExpiringSoon()) {
        const { success, needsLogin } = await authService.initializeAuth();

        if (!success) {
          if (needsLogin) {
            // Refresh Token도 만료됨 -> 로그인 필요
            setIsAuthenticated(false);
            setUser(null);
            return false;
          }
        }
      }

      const response = await authService.checkAuth();

      if (response.error) {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      setIsAuthenticated(true);
      setUser(response.data?.user || null);
      return true;
    } catch (error) {
      console.error("인증 상태 확인 중 오류:", error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, []);

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
      tokenStorage.clearAccessToken();

      setIsAuthenticated(false);
      setUser(null);

      addError({
        message: ERROR_MESSAGES.AUTH.LOGOUT_SUCCESS,
        severity: "info",
      });

      router.push("/login");
    } catch {
      tokenStorage.clearAccessToken();
      setIsAuthenticated(false);
      setUser(null);
      router.push("/login");
    }
  }, [addError, router]);

  useEffect(() => {
    const initAuth = async () => {
      const isAuth = await checkAuthStatus();
      setIsLoading(false);

      if (!isAuth) {
        addError({
          message: ERROR_MESSAGES.AUTH.SESSION_EXPIRED,
          code: ERROR_CODES.AUTH_EXPIRED,
          severity: "warning",
        });

        router.push("/login?sessionExpired=true");
      }
    };

    initAuth();
  }, [router, checkAuthStatus, addError]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        logout: handleLogout,
        checkAuth: checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuthContext must be used within an AuthProvider");

  return context;
};
