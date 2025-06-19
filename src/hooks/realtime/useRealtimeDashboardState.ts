import { useMemo } from "react";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import { DashboardStateResult } from "@/types/domains/realtime/entities";

export const useRealtimeDashboardState = (): DashboardStateResult => {
  const { subscribedSymbols, isLoading } = useStockOperations();

  return useMemo((): DashboardStateResult => {
    const hasSubscriptions = subscribedSymbols.length > 0;
    const showLoading = isLoading;
    const showEmptyState = !hasSubscriptions && !isLoading;

    return {
      isLoading,
      hasSubscriptions,
      showLoading,
      showEmptyState,
      subscribedSymbols,
    };
  }, [subscribedSymbols, isLoading]);
};
