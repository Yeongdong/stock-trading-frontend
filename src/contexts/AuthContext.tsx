import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "@/services/api";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
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
      console.error("Auth check error:", error);
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
      csrfService.clearToken();
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
      // 공개 페이지인 경우 인증 체크를 하지 않음
      if (publicRoutes.includes(pathname)) {
        setIsLoading(false);
        return;
      }

      // 보호된 페이지인 경우에만 인증 체크
      try {
        const isAuth = await checkAuth();

        if (!isAuth) {
          router.push("/login?sessionExpired=true");
        }
      } catch (error) {
        console.warn("초기 인증 확인 실패:", error);
        setIsLoading(false);
        router.push("/login");
      }
    };

    initAuth();
  }, [pathname, router]);

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
