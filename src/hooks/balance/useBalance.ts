import { useCallback, useState, useEffect } from "react";
import { balanceService } from "@/services/api/balance/balanceService";
import { Balance } from "@/types/domains/stock";

export const useBalance = () => {
  const [balanceData, setBalanceData] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await balanceService.getBalance();
      setBalanceData(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    balanceData,
    isLoading,
    refresh,
  };
};
