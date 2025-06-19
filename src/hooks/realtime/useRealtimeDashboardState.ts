import { useMemo } from "react";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import { RealtimeDashboardState } from "@/types/domains/realtime/hooks";

export const useRealtimeDashboard = (): RealtimeDashboardState => {
  const { subscribedSymbols, isLoading } = useStockOperations();

  return useMemo((): RealtimeDashboardState => {
    const hasSubscriptions = subscribedSymbols.length > 0;
    const showEmptyState = !hasSubscriptions && !isLoading;

    return {
      subscribedSymbols,
      isLoading,
      hasSubscriptions,
      showEmptyState,
    };
  }, [subscribedSymbols, isLoading]);
};
