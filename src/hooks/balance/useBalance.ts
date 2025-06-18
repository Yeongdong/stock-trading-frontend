import { useCallback, useState } from "react";
import { useError } from "@/contexts/ErrorContext";
import { balanceService } from "@/services/api/balance/balanceService";
import { StockBalance } from "@/types/domains/stock/balance";
import { ErrorHandler } from "@/utils/errorHandler";

export const useBalance = () => {
  const [balance, setBalance] = useState<StockBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  const fetchBalance = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await balanceService.getBalance();
      setBalance(data);

      addError({
        message: "잔고 데이터가 갱신되었습니다.",
        severity: "info",
      });
    } catch (error) {
      const standardError = ErrorHandler.standardize(error);

      setError(standardError.message);
      addError({
        message: standardError.message,
        code: standardError.code,
        severity: standardError.severity,
      });
    } finally {
      setIsLoading(false);
    }
  }, [addError]);

  const clearBalance = useCallback(() => {
    setBalance(null);
    setError(null);
  }, []);

  return {
    balance,
    isLoading,
    error,
    fetchBalance,
    clearBalance,
  };
};
