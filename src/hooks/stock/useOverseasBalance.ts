import { useState, useCallback } from "react";
import { overseasBalanceService } from "@/services/api/balance/overseasBalanceService";
import {
  OverseasAccountBalance,
  UseOverseasBalanceResult,
} from "@/types/domains/stock/overseas-balance";

export const useOverseasBalance = (): UseOverseasBalanceResult => {
  const [balance, setBalance] = useState<OverseasAccountBalance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const result = await overseasBalanceService.getOverseasBalance();

    if (result) {
      setBalance(result);
    } else {
      setError("해외 잔고 조회에 실패했습니다.");
    }

    setIsLoading(false);
  }, []);

  const clearBalance = useCallback((): void => {
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
