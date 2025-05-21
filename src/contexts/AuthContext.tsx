import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "@/services/api";
import { useRouter } from "next/router";
import { useError } from "./ErrorContext";
import { ERROR_MESSAGES } from "@/constants";
import { AuthContextType, AuthUser } from "@/types";
import { csrfService } from "@/services/security/csrfService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();
  const { addError } = useError();

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.checkAuth();

      if (response.error) {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      setIsAuthenticated(true);
      setUser(response.data?.User || null);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      addError({
        message: ERROR_MESSAGES.AUTH.LOGOUT_SUCCESS,
        severity: "info",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const publicRoutes = ["/login", "/"];

    const initAuth = async () => {
      try {
        await csrfService.getCsrfToken();
      } catch (error) {
        console.warn("초기 CSRF 토큰 로드 실패:", error);
      }

      const isAuth = await checkAuth();

      if (!isAuth && !publicRoutes.includes(router.pathname)) {
        router.push("/login?sessionExpired=true");
      }
    };

    initAuth();
  }, [router, router.pathname]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
