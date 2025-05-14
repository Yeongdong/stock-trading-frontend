"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
  useRef,
} from "react";
import { StockTransaction } from "@/types";
import { realTimeService } from "@/services/realtime/realTimeService";
import { useError } from "./ErrorContext";
import { ERROR_MESSAGES } from "@/constants";
import { realtimeApi } from "@/api/realtimeApi";

interface RealtimePriceContextType {
  stockData: Record<string, StockTransaction>;
  isConnected: boolean;
  error: string | null;
  getStockData: (symbol: string) => StockTransaction | null;
}

// Context 생성
const RealtimePriceContext = createContext<
  RealtimePriceContextType | undefined
>(undefined);

// Provider 컴포넌트
export const RealtimePriceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [stockData, setStockData] = useState<Record<string, StockTransaction>>(
    {}
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  // 첫 연결 여부를 추적하기 위한 ref
  const isInitializedRef = useRef<boolean>(false);
  // 서비스 시작 중인지 추적하기 위한 ref
  const isStartingRef = useRef<boolean>(false);

  // 실시간 데이터 수신 핸들러
  const handleStockPrice = useCallback((data: StockTransaction) => {
    setStockData((prevData) => {
      const prevStock = prevData[data.symbol];
      if (prevStock && JSON.stringify(prevStock) === JSON.stringify(data)) {
        return prevData;
      }

      return {
        ...prevData,
        [data.symbol]: data,
      };
    });
  }, []);

  // 특정 종목 데이터 가져오기
  const getStockData = useCallback(
    (symbol: string): StockTransaction | null => {
      return stockData[symbol] || null;
    },
    [stockData]
  );

  // 실시간 서비스 시작
  const startRealTimeService = useCallback(async () => {
    if (isStartingRef.current || isConnected) {
      return isConnected;
    }

    isStartingRef.current = true;

    try {
      // 서버측 실시간 서비스 시작
      const response = await realtimeApi.startRealTimeService();

      if (response.error) {
        throw new Error(response.error);
      }

      // 클라이언트측 WebSocket 연결 시작
      realTimeService.setErrorCallback((errorMessage) => {
        addError({
          message: errorMessage,
          severity: "error",
        });
      });

      const connected = await realTimeService.start();
      setIsConnected(connected);

      if (connected) {
        if (!isInitializedRef.current) {
          addError({
            message: ERROR_MESSAGES.REALTIME.SERVICE_START,
            severity: "info",
          });
          isInitializedRef.current = true;
        }
        setError(null);
      } else {
        throw new Error("실시간 데이터 연결 실패");
      }

      return connected;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`실시간 서비스 시작 실패: ${errorMsg}`);
      addError({
        message: ERROR_MESSAGES.REALTIME.CONNECTION_FAILED,
        severity: "error",
      });
      return false;
    } finally {
      isStartingRef.current = false;
    }
  }, [isConnected, addError]);

  // 실시간 서비스 초기화
  useEffect(() => {
    let isActive = true;

    const initializeRealTimeService = async () => {
      const connected = await startRealTimeService();

      if (connected && isActive) {
        // 구독 이벤트 설정
        const unsubscribe = realTimeService.subscribe(
          "stockPrice",
          handleStockPrice
        );

        return () => {
          unsubscribe();
          if (isActive) {
            realTimeService.stop();
          }
        };
      }
    };

    initializeRealTimeService();

    // 컴포넌트 언마운트시 연결 종료
    return () => {
      isActive = false;
      realTimeService.stop();
    };
  }, [startRealTimeService, handleStockPrice]);

  const contextValue = useMemo(
    () => ({
      stockData,
      isConnected,
      error,
      getStockData,
    }),
    [stockData, isConnected, error, getStockData]
  );

  return (
    <RealtimePriceContext.Provider value={contextValue}>
      {children}
    </RealtimePriceContext.Provider>
  );
};

export const useRealtimePrice = () => {
  const context = useContext(RealtimePriceContext);
  if (context === undefined) {
    throw new Error(
      "useRealtimePrice must be used within a RealtimePriceProvider"
    );
  }
  return context;
};
