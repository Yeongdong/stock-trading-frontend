import { useCallback, useMemo } from "react";
import { useStockSubscription } from "@/contexts/StockSubscriptionContext";
import { useChartData } from "@/contexts/ChartDataContext";
import { useStockData } from "@/contexts/StockDataContext";
import { useError } from "@/contexts/ErrorContext";
import { ERROR_MESSAGES } from "@/constants";

export const useStockOperations = () => {
  const {
    subscribedSymbols,
    isLoading: subscriptionLoading,
    subscribeSymbol,
    unsubscribeSymbol,
    isSubscribed,
  } = useStockSubscription();

  const {
    getStockData,
    isLoading: stockDataLoading,
    error: stockDataError,
  } = useStockData();

  const { getChartData } = useChartData();
  const { addError } = useError();

  // 구독 관련 기능 래퍼
  const handleSubscribeSymbol = useCallback(
    async (symbol: string) => {
      try {
        const success = await subscribeSymbol(symbol);
        if (success) {
          addError({
            message: ERROR_MESSAGES.REALTIME.SUBSCRIBE_SUCCESS(symbol),
            severity: "info",
          });
        }
        return success;
      } catch (error) {
        console.error(error);
        addError({
          message: ERROR_MESSAGES.REALTIME.SUBSCRIBE_FAIL(symbol),
          severity: "error",
        });
        return false;
      }
    },
    [subscribeSymbol, addError]
  );

  const handleUnsubscribeSymbol = useCallback(
    async (symbol: string) => {
      try {
        const success = await unsubscribeSymbol(symbol);
        if (success) {
          addError({
            message: ERROR_MESSAGES.REALTIME.UNSUBSCRIBE_SUCCESS(symbol),
            severity: "info",
          });
        }
        return success;
      } catch (error) {
        console.error(error);
        addError({
          message: ERROR_MESSAGES.REALTIME.UNSUBSCRIBE_FAIL(symbol),
          severity: "error",
        });
        return false;
      }
    },
    [unsubscribeSymbol, addError]
  );

  return useMemo(
    () => ({
      subscribedSymbols,
      isLoading: subscriptionLoading || stockDataLoading,
      error: stockDataError,

      subscribeSymbol: handleSubscribeSymbol,
      unsubscribeSymbol: handleUnsubscribeSymbol,
      isSubscribed,

      getStockData,
      getChartData,
    }),
    [
      subscribedSymbols,
      subscriptionLoading,
      stockDataLoading,
      stockDataError,
      handleSubscribeSymbol,
      handleUnsubscribeSymbol,
      isSubscribed,
      getStockData,
      getChartData,
    ]
  );
};
