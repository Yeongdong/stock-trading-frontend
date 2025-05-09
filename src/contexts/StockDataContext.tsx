import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { StockTransaction } from "@/types";
import { realTimeService } from "@/services/realtime/realTimeService";
import { ERROR_MESSAGES } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { useStockSubscription } from "@/hooks/stock/useStockSubscription";
import {
  useChartData,
  PriceDataPoint,
  ChartDataState,
} from "@/hooks/stock/useChartData";

// 주가 데이터 저장 인터페이스
interface StockDataState {
  [symbol: string]: StockTransaction;
}

// 컨텍스트에서 제공할 값들의 인터페이스
interface StockDataContextType {
  stockData: StockDataState;
  subscribedSymbols: string[];
  isLoading: boolean;
  error: string | null;
  chartData: ChartDataState;
  subscribeSymbol: (symbol: string) => Promise<boolean>;
  unsubscribeSymbol: (symbol: string) => Promise<boolean>;
  isSubscribed: (symbol: string) => boolean;
  getStockData: (symbol: string) => StockTransaction | null;
  getChartData: (symbol: string) => PriceDataPoint[];
}

// 기본값으로 빈 객체를 가진 컨텍스트 생성
const StockDataContext = createContext<StockDataContextType>({
  stockData: {},
  subscribedSymbols: [],
  isLoading: false,
  error: null,
  chartData: {},
  subscribeSymbol: async () => false,
  unsubscribeSymbol: async () => false,
  isSubscribed: () => false,
  getStockData: () => null,
  getChartData: () => [],
});

export const useStockData = () => useContext(StockDataContext);

export const StockDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stockData, setStockData] = useState<StockDataState>({});
  const [isRealtimeConnected, setIsRealtimeConnected] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  const {
    subscribedSymbols,
    isLoading,
    subscribeSymbol,
    unsubscribeSymbol,
    isSubscribed,
    updateSubscribedSymbols,
    initializeSubscriptions,
  } = useStockSubscription();

  const { chartData, updateChartData, getChartData, removeChartData } =
    useChartData();

  // 실시간 데이터 수신 핸들러
  const handleStockPrice = useCallback(
    (data: StockTransaction) => {
      setStockData((prevData) => ({
        ...prevData,
        [data.symbol]: data,
      }));

      // 차트 데이터 업데이트
      updateChartData(data);
    },
    [updateChartData]
  );

  // 특정 종목 데이터 삭제 처리
  const handleUnsubscribe = useCallback(
    async (symbol: string): Promise<boolean> => {
      const success = await unsubscribeSymbol(symbol);
      if (success) {
        // 주식 데이터 삭제
        setStockData((prevData) => {
          const newData = { ...prevData };
          delete newData[symbol];
          return newData;
        });

        // 차트 데이터 삭제
        removeChartData(symbol);
      }
      return success;
    },
    [unsubscribeSymbol, removeChartData]
  );

  // 특정 종목 데이터 가져오기
  const getStockData = useCallback(
    (symbol: string): StockTransaction | null => {
      return stockData[symbol] || null;
    },
    [stockData]
  );

  // 실시간 서비스 초기화 및 구독 설정
  useEffect(() => {
    const initializeRealTimeService = async () => {
      try {
        // 실시간 서비스 오류 핸들러 설정
        realTimeService.setErrorCallback((errorMessage) => {
          addError({
            message: errorMessage,
            severity: "error",
          });
        });

        // SignalR 연결 시작
        const connected = await realTimeService.start();
        setIsRealtimeConnected(connected);

        if (connected) {
          // 구독 이벤트 설정
          const unsubscribe = realTimeService.subscribe(
            "stockPrice",
            handleStockPrice
          );

          // 기존 구독 초기화
          await initializeSubscriptions();

          setError(null);
          return () => {
            unsubscribe();
          };
        } else {
          setError("실시간 데이터 연결 실패");
          addError({
            message: ERROR_MESSAGES.REALTIME.CONNECTION_FAILED,
            severity: "error",
          });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`실시간 서비스 초기화 실패: ${errorMsg}`);
        addError({
          message: ERROR_MESSAGES.REALTIME.CONNECTION_FAILED,
          severity: "error",
        });
      }
    };

    initializeRealTimeService();

    // 컴포넌트 언마운트시 연결 종료
    return () => {
      realTimeService.stop();
    };
  }, [handleStockPrice, initializeSubscriptions, addError]);

  // 컨텍스트 값 생성
  const contextValue = useMemo(
    () => ({
      stockData,
      subscribedSymbols,
      isLoading,
      error,
      chartData,
      subscribeSymbol,
      unsubscribeSymbol: handleUnsubscribe,
      isSubscribed,
      getStockData,
      getChartData,
    }),
    [
      stockData,
      subscribedSymbols,
      isLoading,
      error,
      chartData,
      subscribeSymbol,
      handleUnsubscribe,
      isSubscribed,
      getStockData,
      getChartData,
    ]
  );

  return (
    <StockDataContext.Provider value={contextValue}>
      {children}
    </StockDataContext.Provider>
  );
};
