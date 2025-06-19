import { useCallback } from "react";
import { AuthUser, TokenStatus } from "@/types";
import { userService } from "@/services/api/user/userService";

export const useAuthToken = () => {
  const getTokenStatus = useCallback((user: AuthUser): TokenStatus => {
    if (!user?.kisToken) return TokenStatus.MISSING;

    if (!user.kisToken.accessToken || user.kisToken.accessToken.trim() === "") {
      return TokenStatus.INVALID;
    }

    if (user.kisToken.expiresIn) {
      try {
        const expiresAt = new Date(user.kisToken.expiresIn);
        const now = new Date();

        if (expiresAt <= now) return TokenStatus.EXPIRED;
      } catch (error) {
        console.warn("토큰 만료 시간 파싱 실패:", error);
        return TokenStatus.INVALID;
      }
    }

    return TokenStatus.VALID;
  }, []);

  const refreshToken = useCallback(
    async (appKey: string, appSecret: string, accountNumber: string) => {
      return await userService.refreshKisToken(
        appKey,
        appSecret,
        accountNumber
      );
    },
    []
  );

  const isValidKisConfig = useCallback((user: AuthUser): boolean => {
    return !!(user.kisAppKey && user.kisAppSecret && user.accountNumber);
  }, []);

  return {
    getTokenStatus,
    refreshToken,
    isValidKisConfig,
  };
};
