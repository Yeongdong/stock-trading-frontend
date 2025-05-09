import { useState, useCallback } from "react";
import { useError } from "@/contexts/ErrorContext";
import { ERROR_MESSAGES } from "@/constants";
import { stockSubscriptionService } from "@/services/stockSubscriptionService";

export const useStockSubscription = () => {
  const [subscribedSymbols, setSubscribedSymbols] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  // 구독 목록 업데이트
  const updateSubscribedSymbols = useCallback(() => {
    const symbols = stockSubscriptionService.getSubscribedSymbols();
    setSubscribedSymbols(symbols);
  }, []);

  // 초기화
  const initializeSubscriptions = useCallback(async () => {
    try {
      await stockSubscriptionService.initializeSubscriptions();
      updateSubscribedSymbols();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`구독 초기화 실패: ${errorMsg}`);
    }
  }, [updateSubscribedSymbols]);

  // 종목 구독
  const subscribeSymbol = useCallback(
    async (symbol: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        const success = await stockSubscriptionService.subscribeSymbol(symbol);
        if (success) {
          updateSubscribedSymbols();
          addError({
            message: ERROR_MESSAGES.REALTIME.SUBSCRIBE_SUCCESS(symbol),
            severity: "info",
          });
        }
        return success;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`종목 구독 실패: ${errorMsg}`);
        addError({
          message: ERROR_MESSAGES.REALTIME.SUBSCRIBE_FAIL(symbol),
          severity: "error",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [updateSubscribedSymbols, addError]
  );

  // 종목 구독 취소
  const unsubscribeSymbol = useCallback(
    async (symbol: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        const success = await stockSubscriptionService.unsubscribeSymbol(
          symbol
        );
        if (success) {
          updateSubscribedSymbols();
          addError({
            message: ERROR_MESSAGES.REALTIME.UNSUBSCRIBE_SUCCESS(symbol),
            severity: "info",
          });
        }
        return success;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`종목 구독 취소 실패: ${errorMsg}`);
        addError({
          message: ERROR_MESSAGES.REALTIME.UNSUBSCRIBE_FAIL(symbol),
          severity: "error",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [updateSubscribedSymbols, addError]
  );

  // 구독 여부 확인
  const isSubscribed = useCallback((symbol: string): boolean => {
    return stockSubscriptionService.isSubscribed(symbol);
  }, []);

  return {
    subscribedSymbols,
    isLoading,
    error,
    subscribeSymbol,
    unsubscribeSymbol,
    isSubscribed,
    updateSubscribedSymbols,
    initializeSubscriptions,
  };
};
