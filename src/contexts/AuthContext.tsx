"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import { usePathname, useRouter } from "next/navigation";
import { useError } from "./ErrorContext";
import { ERROR_MESSAGES } from "@/constants";
import { authService } from "@/services/api/auth/authService";
import { ErrorHandler } from "@/utils/errorHandler";
import { ERROR_CODES } from "@/types/common/error";
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
  const pathname = usePathname();
  const { addError } = useError();

  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authService.checkAuth();

      if (response.error) {
        const standardError = ErrorHandler.fromHttpStatus(
          response.status,
          response.error
        );

        if (
          standardError.code === ERROR_CODES.AUTH_EXPIRED ||
          standardError.code === ERROR_CODES.AUTH_INVALID
        ) {
          setIsAuthenticated(false);
          setUser(null);
          return false;
        }

        addError({
          message: standardError.message,
          code: standardError.code,
          severity: standardError.severity,
        });

        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      setIsAuthenticated(true);
      setUser(response.data?.user || null);
      return true;
    } catch (error) {
      const standardError = ErrorHandler.standardize(error);

      // 네트워크 에러 등은 사용자에게 표시
      if (
        standardError.code !== ERROR_CODES.AUTH_EXPIRED &&
        standardError.code !== ERROR_CODES.AUTH_INVALID
      )
        addError({
          message: standardError.message,
          code: standardError.code,
          severity: standardError.severity,
        });

      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, [addError]);

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      const response = await authService.logout();

      if (response.error) {
        const standardError = ErrorHandler.fromHttpStatus(
          response.status,
          response.error
        );
        throw standardError;
      }

      setIsAuthenticated(false);
      setUser(null);

      addError({
        message: ERROR_MESSAGES.AUTH.LOGOUT_SUCCESS,
        severity: "info",
      });

      router.push("/login");
    } catch (error) {
      const standardError = ErrorHandler.standardize(error);

      addError({
        message: standardError.message,
        code: standardError.code,
        severity: standardError.severity,
      });

      setIsAuthenticated(false);
      setUser(null);
      router.push("/login");
    }
  }, [addError, router]);

  useEffect(() => {
    const publicRoutes = ["/login", "/"];

    const initAuth = async () => {
      if (publicRoutes.includes(pathname)) {
        setIsLoading(false);
        return;
      }

      const isAuth = await checkAuthStatus();
      setIsLoading(false);

      if (!isAuth) router.push("/login?sessionExpired=true");
    };

    initAuth();
  }, [pathname, router, checkAuthStatus]);

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
