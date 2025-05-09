// src/contexts/RealtimePriceContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { StockTransaction } from "@/types";
import { realTimeService } from "@/services/realtime/realTimeService";
import { useError } from "./ErrorContext";
import { ERROR_MESSAGES } from "@/constants";
import { realtimeApi } from "@/api/realtimeApi";

// 타입 정의
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

  // 실시간 데이터 수신 핸들러
  const handleStockPrice = useCallback((data: StockTransaction) => {
    setStockData((prevData) => ({
      ...prevData,
      [data.symbol]: data,
    }));
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
        addError({
          message: ERROR_MESSAGES.REALTIME.SERVICE_START,
          severity: "info",
        });
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
    }
  }, [addError]);

  // 실시간 서비스 초기화
  useEffect(() => {
    const initializeRealTimeService = async () => {
      const connected = await startRealTimeService();

      if (connected) {
        // 구독 이벤트 설정
        const unsubscribe = realTimeService.subscribe(
          "stockPrice",
          handleStockPrice
        );

        return () => {
          unsubscribe();
          realTimeService.stop();
        };
      }
    };

    initializeRealTimeService();

    // 컴포넌트 언마운트시 연결 종료
    return () => {
      realTimeService.stop();
    };
  }, [startRealTimeService, handleStockPrice]);

  // Context 값 메모이제이션
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
