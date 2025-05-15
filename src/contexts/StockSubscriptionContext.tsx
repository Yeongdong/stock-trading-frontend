"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useError } from "./ErrorContext";
import { ERROR_MESSAGES } from "@/constants";
import { realtimeApiService } from "@/services/api";
import { StockSubscriptionContextType } from "@/types/contexts/stockData";

// Context 생성
const StockSubscriptionContext = createContext<
  StockSubscriptionContextType | undefined
>(undefined);

// 컨텍스트 제공자 컴포넌트
export const StockSubscriptionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [subscribedSymbols, setSubscribedSymbols] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  // 로컬 스토리지에서 구독 정보 로드
  useEffect(() => {
    const loadSubscriptions = () => {
      try {
        const savedSymbols = localStorage.getItem("subscribed_symbols");
        if (savedSymbols) {
          setSubscribedSymbols(JSON.parse(savedSymbols));
          console.log("저장된 구독 목록 로드:", JSON.parse(savedSymbols));
        }
      } catch (error) {
        console.error("구독 목록 로드 중 오류", error);
        setSubscribedSymbols([]);
      }
    };

    loadSubscriptions();
  }, []);

  // 구독 목록 저장
  const saveSubscriptions = useCallback((symbols: string[]) => {
    try {
      localStorage.setItem("subscribed_symbols", JSON.stringify(symbols));
    } catch (error) {
      console.error("구독 목록 저장 중 오류:", error);
    }
  }, []);

  // 서버의 구독 목록 가져오기
  const fetchSubscriptionsFromServer = useCallback(async () => {
    try {
      const response = await realtimeApiService.getSubscriptions();

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data?.symbols || [];
    } catch (error) {
      console.error("서버 구독 목록 조회 중 오류:", error);
      return [];
    }
  }, []);

  // 구독 초기화 (앱 시작 시)
  const initializeSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      // 서버의 구독 목록 가져오기
      const serverSubscriptions = await fetchSubscriptionsFromServer();

      // 로컬 구독 목록과 서버 구독 목록 비교 및 동기화
      const localOnly = subscribedSymbols.filter(
        (s) => !serverSubscriptions.includes(s)
      );
      const serverOnly = serverSubscriptions.filter(
        (s) => !subscribedSymbols.includes(s)
      );

      // 서버에 없는 로컬 구독 추가
      for (const symbol of localOnly) {
        await realtimeApiService.subscribeSymbol(symbol);
      }

      // 로컬에 없는 서버 구독 추가
      const updatedSymbols = [...subscribedSymbols, ...serverOnly];
      setSubscribedSymbols(updatedSymbols);
      saveSubscriptions(updatedSymbols);

      setError(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setError(`구독 초기화 실패: ${msg}`);
      addError({
        message: ERROR_MESSAGES.REALTIME.CONNECTION_FAILED,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    subscribedSymbols,
    fetchSubscriptionsFromServer,
    saveSubscriptions,
    addError,
  ]);

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    initializeSubscriptions();
  }, [initializeSubscriptions]);

  // 구독 메서드
  const subscribeSymbol = useCallback(
    async (symbol: string): Promise<boolean> => {
      if (subscribedSymbols.includes(symbol)) {
        console.log(`이미 구독중인 종목: ${symbol}`);
        return true;
      }

      try {
        setIsLoading(true);
        const response = await realtimeApiService.subscribeSymbol(symbol);

        if (response.error) {
          throw new Error(response.error);
        }

        // 구독 목록에 추가
        const updatedSymbols = [...subscribedSymbols, symbol];
        setSubscribedSymbols(updatedSymbols);
        saveSubscriptions(updatedSymbols);

        addError({
          message: ERROR_MESSAGES.REALTIME.SUBSCRIBE_SUCCESS(symbol),
          severity: "info",
        });

        return true;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        setError(`종목 구독 실패: ${msg}`);
        addError({
          message: ERROR_MESSAGES.REALTIME.SUBSCRIBE_FAIL(symbol),
          severity: "error",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [subscribedSymbols, saveSubscriptions, addError]
  );

  // 구독 취소 메서드
  const unsubscribeSymbol = useCallback(
    async (symbol: string): Promise<boolean> => {
      if (!subscribedSymbols.includes(symbol)) {
        console.log(`구독 중이 아닌 종목: ${symbol}`);
        return true;
      }

      try {
        setIsLoading(true);
        const response = await realtimeApiService.unsubscribeSymbol(symbol);

        if (response.error) {
          throw new Error(response.error);
        }

        // 구독 목록에서 제거
        const updatedSymbols = subscribedSymbols.filter((s) => s !== symbol);
        setSubscribedSymbols(updatedSymbols);
        saveSubscriptions(updatedSymbols);

        addError({
          message: ERROR_MESSAGES.REALTIME.UNSUBSCRIBE_SUCCESS(symbol),
          severity: "info",
        });

        return true;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        setError(`종목 구독 취소 실패: ${msg}`);
        addError({
          message: ERROR_MESSAGES.REALTIME.UNSUBSCRIBE_FAIL(symbol),
          severity: "error",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [subscribedSymbols, saveSubscriptions, addError]
  );

  // 구독 여부 확인
  const isSubscribed = useCallback(
    (symbol: string): boolean => {
      return subscribedSymbols.includes(symbol);
    },
    [subscribedSymbols]
  );

  // Context 값 메모이제이션
  const contextValue = useMemo(
    () => ({
      subscribedSymbols,
      isLoading,
      error,
      subscribeSymbol,
      unsubscribeSymbol,
      isSubscribed,
    }),
    [
      subscribedSymbols,
      isLoading,
      error,
      subscribeSymbol,
      unsubscribeSymbol,
      isSubscribed,
    ]
  );

  return (
    <StockSubscriptionContext.Provider value={contextValue}>
      {children}
    </StockSubscriptionContext.Provider>
  );
};

export const useStockSubscription = () => {
  const context = useContext(StockSubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useStockSubscription must be used within a StockSubscriptionProvider"
    );
  }
  return context;
};
