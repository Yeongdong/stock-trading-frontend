import { useCallback, useState } from "react";
import { useError } from "@/contexts/ErrorContext";
import { balanceService } from "@/services/api/balance/balanceService";
import { Balance } from "@/types/domains/stock";
import { ErrorHandler } from "@/utils/errorHandler";

export const useBalance = () => {
  const [balanceData, setBalanceData] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addError } = useError();

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await balanceService.getBalance();
      setBalanceData(data);

      addError({
        message: "잔고 데이터가 갱신되었습니다.",
        severity: "info",
      });
    } catch (error) {
      const standardError = ErrorHandler.standardize(error);

      addError({
        message: standardError.message,
        code: standardError.code,
        severity: standardError.severity,
      });
    } finally {
      setIsLoading(false);
    }
  }, [addError]);

  return {
    balanceData,
    isLoading,
    refresh,
  };
};
