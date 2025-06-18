import { useCallback, useState } from "react";
import { useError } from "@/contexts/ErrorContext";
import { authService } from "@/services/api/auth/authService";
import { ErrorHandler } from "@/utils/errorHandler";
import { ERROR_CODES, StandardError } from "@/types/common/error";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addError } = useError();

  const login = useCallback(
    async (credential: string) => {
      if (!credential?.trim()) {
        const validationError: StandardError = {
          code: ERROR_CODES.VALIDATION_REQUIRED,
          message: "인증정보: Google 인증이 필요합니다",
          severity: "warning",
        };

        addError({
          message: validationError.message,
          code: validationError.code,
          severity: validationError.severity,
        });
        return { success: false };
      }

      setIsLoading(true);

      try {
        const response = await authService.googleLogin(credential);

        if (response.error) {
          const standardError = ErrorHandler.fromHttpStatus(
            response.status,
            response.error
          );
          throw standardError;
        }

        addError({
          message: "로그인에 성공했습니다.",
          severity: "info",
        });

        return { success: true, data: response.data };
      } catch (error) {
        const standardError = ErrorHandler.standardize(error);

        addError({
          message: standardError.message,
          code: standardError.code,
          severity: standardError.severity,
        });

        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [addError]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await authService.logout();

      if (response.error) {
        const standardError = ErrorHandler.fromHttpStatus(
          response.status,
          response.error
        );
        throw standardError;
      }

      addError({
        message: "로그아웃 되었습니다.",
        severity: "info",
      });

      return { success: true };
    } catch (error) {
      const standardError = ErrorHandler.standardize(error);

      addError({
        message: standardError.message,
        code: standardError.code,
        severity: standardError.severity,
      });

      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [addError]);

  const checkAuth = useCallback(async () => {
    try {
      const response = await authService.checkAuth();

      if (response.error) {
        const standardError = ErrorHandler.fromHttpStatus(
          response.status,
          response.error
        );
        throw standardError;
      }

      return { success: true, data: response.data };
    } catch (error) {
      const standardError = ErrorHandler.standardize(error);

      if (
        standardError.code === ERROR_CODES.AUTH_EXPIRED ||
        standardError.code === ERROR_CODES.AUTH_INVALID
      ) {
        return { success: false, needLogin: true };
      }

      addError({
        message: standardError.message,
        code: standardError.code,
        severity: standardError.severity,
      });

      return { success: false, needLogin: false };
    }
  }, [addError]);

  return {
    isLoading,
    login,
    logout,
    checkAuth,
  };
};
