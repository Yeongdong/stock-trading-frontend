import { useState, useEffect, useCallback } from "react";
import { StockBalance } from "@/types/stock/balance";
import { useError } from "@/contexts/ErrorContext";
import { balanceService } from "@/services/api/balance/balanceService";
import { ERROR_MESSAGES } from "@/constants";

export const useBalance = () => {
  const [balanceData, setBalanceData] = useState<StockBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addError } = useError();

  const fetchBalanceData = useCallback(async () => {
    try {
      setIsLoading(true);

      const balance = await balanceService.getBalance();
      setBalanceData(balance);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : ERROR_MESSAGES.BALANCE.FETCH_FAILED;
      addError({
        message: errorMessage,
        severity: "error",
      });
      console.error("Balance fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [addError]);

  useEffect(() => {
    fetchBalanceData();
  }, [fetchBalanceData]);

  return {
    balanceData,
    isLoading,
    fetchBalanceData,
    refetch: fetchBalanceData,
  };
};
