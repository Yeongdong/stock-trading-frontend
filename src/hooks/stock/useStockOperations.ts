import { useCallback, useMemo } from "react";
import { useStockSubscription } from "@/contexts/StockSubscriptionContext";
import { useChartData } from "@/contexts/ChartDataContext";
import { useStockData } from "@/contexts/StockDataContext";

export const useStockOperations = () => {
  const {
    subscribedSymbols,
    isLoading: subscriptionLoading,
    subscribeSymbol,
    unsubscribeSymbol,
    isSubscribed,
  } = useStockSubscription();

  const { getStockData, isLoading: stockDataLoading } = useStockData();
  const { getChartData } = useChartData();

  // 구독 관련 기능 래핑
  const handleSubscribeSymbol = useCallback(
    async (symbol: string): Promise<boolean> => {
      return await subscribeSymbol(symbol);
    },
    [subscribeSymbol]
  );

  const handleUnsubscribeSymbol = useCallback(
    async (symbol: string): Promise<boolean> => {
      return await unsubscribeSymbol(symbol);
    },
    [unsubscribeSymbol]
  );

  return useMemo(
    () => ({
      // 구독 상태
      subscribedSymbols,
      isLoading: subscriptionLoading || stockDataLoading,

      // 구독 관리
      subscribeSymbol: handleSubscribeSymbol,
      unsubscribeSymbol: handleUnsubscribeSymbol,
      isSubscribed,

      // 데이터 접근
      getStockData,
      getChartData,
    }),
    [
      subscribedSymbols,
      subscriptionLoading,
      stockDataLoading,
      handleSubscribeSymbol,
      handleUnsubscribeSymbol,
      isSubscribed,
      getStockData,
      getChartData,
    ]
  );
};
