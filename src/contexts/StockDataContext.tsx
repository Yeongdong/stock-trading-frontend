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
  subscribeSymbol: (symbol: string) => Promise<boolean>;
  unsubscribeSymbol: (symbol: string) => Promise<boolean>;
  isSubscribed: (symbol: string) => boolean;
  getStockData: (symbol: string) => StockTransaction | null;
}

// 기본값으로 빈 객체를 가진 컨텍스트 생성
const StockDataContext = createContext<StockDataContextType>({
  stockData: {},
  subscribedSymbols: [],
  isLoading: false,
  error: null,
  subscribeSymbol: async () => false,
  unsubscribeSymbol: async () => false,
  isSubscribed: () => false,
  getStockData: () => null,
});

// 컨텍스트 사용을 위한 커스텀 훅
export const useStockData = () => useContext(StockDataContext);

// 컨텍스트 프로바이더 컴포넌트
export const StockDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 상태 정의
  const [stockData, setStockData] = useState<StockDataState>({});
  const [subscribedSymbols, setSubscribedSymbols] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] =
    useState<boolean>(false);

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
  }, []);

  // 종목 구독 함수
  const subscribeSymbol = useCallback(
    async (symbol: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        const success = await stockSubscriptionService.subscribeSymbol(symbol);
        if (success) {
          updateSubscribedSymbols();
        }
        return success;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`종목 구독 실패: ${errorMsg}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [updateSubscribedSymbols]
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
          // 구독 취소시 데이터에서도 해당 종목 제거
          setStockData((prevData) => {
            const newData = { ...prevData };
            delete newData[symbol];
            return newData;
          });
        }
        return success;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`종목 구독 취소 실패: ${errorMsg}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [updateSubscribedSymbols]
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
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`실시간 서비스 초기화 실패: ${errorMsg}`);
      } finally {
        setIsLoading(false);
      }
    };
    initializeRealTimeService();

    // 컴포넌트 언마운트시 연결 종료
    return () => {
      realTimeService.stop();
    };
  }, [handleStockPrice, updateSubscribedSymbols]);

  // 컨텍스트 값 생성(불필요한 렌더링 방지를 위해 useMemo 사용)
  const contextValue = useMemo(
    () => ({
      stockData,
      subscribedSymbols,
      isLoading,
      error,
      subscribeSymbol,
      unsubscribeSymbol,
      isSubscribed,
      getStockData,
    }),
    [
      stockData,
      subscribedSymbols,
      isLoading,
      error,
      subscribeSymbol,
      unsubscribeSymbol,
      isSubscribed,
      getStockData,
    ]
  );
  return (
    <StockDataContext.Provider value={contextValue}>
      {children}
    </StockDataContext.Provider>
  );
};
