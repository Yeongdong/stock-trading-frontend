import { useState, useEffect, useMemo } from "react";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import { DashboardStateResult } from "@/types";

export const useDashboardState = (): DashboardStateResult => {
  const { subscribedSymbols } = useStockOperations();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        document.title = "실시간 주가 모니터링";
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  const hasSubscriptions = useMemo(
    () => subscribedSymbols.length > 0,
    [subscribedSymbols]
  );

  const showLoading = useMemo(
    () => isLoading && !hasSubscriptions,
    [isLoading, hasSubscriptions]
  );

  const showEmptyState = useMemo(
    () => !hasSubscriptions && !isLoading,
    [hasSubscriptions, isLoading]
  );

  return {
    isLoading,
    error,
    hasSubscriptions,
    showLoading,
    showEmptyState,
    subscribedSymbols,
  };
};
