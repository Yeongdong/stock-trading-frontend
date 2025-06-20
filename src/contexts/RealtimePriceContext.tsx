"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
  useRef,
} from "react";
import { realtimeSocketService } from "@/services/realtime/realtimeSocketService";
import { realtimeApiService } from "@/services/api/realtime/realtimeApiService";
import { useError } from "./ErrorContext";
import {
  RealtimeAction,
  RealtimeCallbacks,
  RealtimePriceContextType,
  RealtimeState,
} from "@/types/domains/realtime/context";
import { StockCode } from "@/types";
import { RealtimeStockData } from "@/types/domains/realtime/entities";
import { useAuthContext } from "./AuthContext";

const initialState: RealtimeState = {
  stockData: {},
  isConnected: false,
  error: null,
};

function realtimePriceReducer(
  state: RealtimeState,
  action: RealtimeAction
): RealtimeState {
  try {
    switch (action.type) {
      case "UPDATE_STOCK_DATA":
        return {
          ...state,
          stockData: {
            ...state.stockData,
            [action.payload.symbol]: action.payload.data,
          },
        };
      case "SET_CONNECTED":
        return {
          ...state,
          isConnected: action.payload,
        };
      case "SET_ERROR":
        return {
          ...state,
          error: action.payload,
        };
      case "REMOVE_STOCK_DATA": {
        const newStockData = { ...state.stockData };
        delete newStockData[action.payload];
        return {
          ...state,
          stockData: newStockData,
        };
      }
      default:
        return state;
    }
  } catch (error) {
    console.error("Realtime reducer error:", error);
    return state;
  }
}

const RealtimePriceContext = createContext<
  RealtimePriceContextType | undefined
>(undefined);

export const RealtimePriceProvider: React.FC<{
  children: ReactNode;
  callbacks?: RealtimeCallbacks;
}> = ({ children, callbacks }) => {
  const [state, dispatch] = useReducer(realtimePriceReducer, initialState);
  const { addError } = useError();
  const { isAuthenticated, isLoading } = useAuthContext();

  const isInitializedRef = useRef<boolean>(false);
  const cleanupFunctionRef = useRef<(() => void) | null>(null);

  const handleStockPrice = useCallback(
    (data: RealtimeStockData) => {
      try {
        if (!data || !data.symbol || typeof data.price !== "number") {
          console.warn("Invalid realtime stock data:", data);
          return;
        }

        dispatch({
          type: "UPDATE_STOCK_DATA",
          payload: { symbol: data.symbol, data },
        });

        callbacks?.onStockDataUpdate?.(data);
        callbacks?.onChartDataUpdate?.(data);
      } catch (error) {
        console.error("Stock price handler error:", error);
      }
    },
    [callbacks]
  );

  // 실시간 서비스 시작
  const startRealTimeService = useCallback(async (): Promise<boolean> => {
    try {
      if (!isAuthenticated) return false;
      if (state.isConnected && isInitializedRef.current) return true;

      const response = await realtimeApiService.startRealTimeService();
      if (response.error) return false;

      realtimeSocketService.setErrorCallback((errorMessage) => {
        addError({
          message: `실시간 연결 오류: ${errorMessage}`,
          severity: "error",
        });
        dispatch({ type: "SET_CONNECTED", payload: false });
      });

      const connected = await realtimeSocketService.start();

      if (connected) {
        const unsubscribe = realtimeSocketService.subscribe(
          "stockPrice",
          handleStockPrice
        );

        cleanupFunctionRef.current = () => {
          unsubscribe();
          realtimeSocketService.stop();
        };

        dispatch({ type: "SET_CONNECTED", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });
        isInitializedRef.current = true;

        return true;
      } else {
        dispatch({ type: "SET_CONNECTED", payload: false });
        return false;
      }
    } catch (error) {
      console.error("Realtime service start error:", error);
      dispatch({ type: "SET_CONNECTED", payload: false });
      return false;
    }
  }, [isAuthenticated, state.isConnected, handleStockPrice, addError]);

  // 종목 데이터 조회
  const getStockData = useCallback(
    (symbol: StockCode): RealtimeStockData | null => {
      try {
        return state.stockData[symbol] || null;
      } catch (error) {
        console.error("Get stock data error:", error);
        return null;
      }
    },
    [state.stockData]
  );

  // 종목 데이터 제거
  const removeStockData = useCallback((symbol: StockCode) => {
    try {
      if (!symbol) return;
      dispatch({ type: "REMOVE_STOCK_DATA", payload: symbol });
    } catch (error) {
      console.error("Remove stock data error:", error);
    }
  }, []);

  // 자동 초기화 및 정리
  useEffect(() => {
    if (!isAuthenticated || isLoading || isInitializedRef.current) return;

    const initializeService = async () => {
      await startRealTimeService();
    };

    initializeService();

    return () => {
      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
        cleanupFunctionRef.current = null;
      }
      isInitializedRef.current = false;
      dispatch({ type: "SET_CONNECTED", payload: false });
    };
  }, [isAuthenticated, isLoading, startRealTimeService]);

  const contextValue = useMemo(
    () => ({
      stockData: state.stockData,
      isConnected: state.isConnected,
      error: state.error,
      getStockData,
      removeStockData,
    }),
    [
      state.stockData,
      state.isConnected,
      state.error,
      getStockData,
      removeStockData,
    ]
  );

  return (
    <RealtimePriceContext.Provider value={contextValue}>
      {children}
    </RealtimePriceContext.Provider>
  );
};

export const useRealtimePrice = (): RealtimePriceContextType => {
  const context = useContext(RealtimePriceContext);
  if (context === undefined)
    throw new Error(
      "useRealtimePrice must be used within a RealtimePriceProvider"
    );

  return context;
};
