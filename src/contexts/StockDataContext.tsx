import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { StockTransaction } from "@/types";
import { realTimeService } from "@/services/realTimeService";
import { stockSubscriptionService } from "@/services/stockSubscriptionService";
import { LIMITS, ERROR_MESSAGES } from "@/constants";
import { useError } from "@/contexts/ErrorContext";

// 차트 데이터 포인트 인터페이스
interface PriceDataPoint {
  time: string;
  price: number;
}

// 주가 데이터 저장 인터페이스
interface StockDataState {
  [symbol: string]: StockTransaction;
}

// 차트 데이터를 저장할 인터페이스
interface ChartDataState {
  [symbol: string]: PriceDataPoint[];
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
  const [subscribedSymbols, setSubscribedSymbols] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] =
    useState<boolean>(false);
  const [chartData, setChartData] = useState<ChartDataState>({});
  const { addError } = useError();

  // 종목 구독 상태 업데이트 함수
  const updateSubscribedSymbols = useCallback(() => {
    const symbols = stockSubscriptionService.getSubscribedSymbols();
    setSubscribedSymbols(symbols);
  }, []);

  // 실시간 데이터 수신 핸들러
  const handleStockPrice = useCallback((data: StockTransaction) => {
    setStockData((prevData) => ({
      ...prevData,
      [data.symbol]: data,
    }));

    setChartData((prevChartData) => {
      const symbol = data.symbol;
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        price: data.price,
      };

      const currentData = prevChartData[symbol] || [];

      // 최대 길이 제한을 위해 필요시 오래된 데이터 제거
      const updatedData = [...currentData, newDataPoint].slice(
        -(-LIMITS.MAX_CHART_DATA_POINTS)
      );

      return {
        ...prevChartData,
        [symbol]: updatedData,
      };
    });
  }, []);

  // 차트 데이터 조회 함수
  const getChartData = useCallback(
    (symbol: string): PriceDataPoint[] => {
      return chartData[symbol] || [];
    },
    [chartData]
  );

  // 종목 구독 함수
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

  // 종목 구독 취소 함수
  const unsubscribeSymbol = useCallback(
    async (symbol: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        const success = await stockSubscriptionService.unsubscribeSymbol(
          symbol
        );
        if (success) {
          updateSubscribedSymbols();

          setStockData((prevData) => {
            const newData = { ...prevData };
            delete newData[symbol];
            return newData;
          });
          setChartData((prevChartData) => {
            const newChartData = { ...prevChartData };
            delete newChartData[symbol];
            return newChartData;
          });

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

  // 종목 구독 확인 함수
  const isSubscribed = useCallback((symbol: string): boolean => {
    return stockSubscriptionService.isSubscribed(symbol);
  }, []);

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
        setIsLoading(true);

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
          await stockSubscriptionService.initializeSubscriptions();
          updateSubscribedSymbols();

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
      } finally {
        setIsLoading(false);
      }
    };

    initializeRealTimeService();

    // 컴포넌트 언마운트시 연결 종료
    return () => {
      realTimeService.stop();
    };
  }, [handleStockPrice, updateSubscribedSymbols, addError]);

  // 컨텍스트 값 생성(불필요한 렌더링 방지를 위해 useMemo 사용)
  const contextValue = useMemo(
    () => ({
      stockData,
      subscribedSymbols,
      isLoading,
      error,
      chartData,
      subscribeSymbol,
      unsubscribeSymbol,
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
      unsubscribeSymbol,
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
