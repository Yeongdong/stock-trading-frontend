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
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      setIsAuthenticated(true);
      setUser(response.data?.user || null);
      return true;
    } catch {
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, []);

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();

      setIsAuthenticated(false);
      setUser(null);

      addError({
        message: ERROR_MESSAGES.AUTH.LOGOUT_SUCCESS,
        severity: "info",
      });

      router.push("/login");
    } catch {
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
