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
import {
  StockTransaction,
  RealtimePriceAction,
  RealtimePriceState,
  RealtimePriceActions,
} from "@/types";
import { realtimeSocketService } from "@/services/realtime/realtimeSocketService";
import { realtimeApiService } from "@/services/api";
import { useError } from "./ErrorContext";
import { useAuth } from "./AuthContext";
import { ERROR_MESSAGES } from "@/constants";

const initialState: RealtimePriceState = {
  stockData: {},
  isConnected: false,
  error: null,
};

function realtimePriceReducer(
  state: RealtimePriceState,
  action: RealtimePriceAction
): RealtimePriceState {
  console.log("🔄 [RealtimePriceReducer] action 수신:", action.type, action);

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
    case "REMOVE_STOCK_DATA":
      const newStockData = { ...state.stockData };
      delete newStockData[action.payload];
      return {
        ...state,
        stockData: newStockData,
      };
    default:
      return state;
  }
}

const RealtimePriceStateContext = createContext<RealtimePriceState | undefined>(
  undefined
);
const RealtimePriceActionsContext = createContext<
  RealtimePriceActions | undefined
>(undefined);

export const RealtimePriceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(realtimePriceReducer, initialState);
  const { addError } = useError();
  const { isAuthenticated, isLoading } = useAuth();

  const isInitializedRef = useRef<boolean>(false);
  const cleanupFunctionRef = useRef<(() => void) | null>(null);

  const handleStockPrice = useCallback((data: StockTransaction) => {
    dispatch({
      type: "UPDATE_STOCK_DATA",
      payload: { symbol: data.symbol, data },
    });
  }, []);

  // 실시간 서비스 시작
  const startRealTimeService = useCallback(async () => {
    if (!isAuthenticated) return false;

    if (state.isConnected && isInitializedRef.current) return true;

    try {
      // 1. 서버측 실시간 서비스 시작
      const response = await realtimeApiService.startRealTimeService();
      if (response.error) throw new Error(response.error);

      // 2. 클라이언트측 WebSocket 연결 시작
      realtimeSocketService.setErrorCallback((errorMessage) => {
        console.error("SignalR 오류:", errorMessage);
        addError({
          message: errorMessage,
          severity: "error",
        });
      });

      const connected = await realtimeSocketService.start();

      if (connected) {
        // 3. 이벤트 핸들러 등록
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

        addError({
          message: ERROR_MESSAGES.REALTIME.SERVICE_START,
          severity: "info",
        });

        return true;
      } else {
        throw new Error("SignalR 연결 실패");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("실시간 서비스 시작 실패:", errorMsg);

      addError({
        message: ERROR_MESSAGES.REALTIME.CONNECTION_FAILED,
        severity: "error",
      });
      return false;
    }
  }, [isAuthenticated, state.isConnected, handleStockPrice, addError]);

  // 특정 종목 데이터 가져오기
  const getStockData = useCallback(
    (symbol: string): StockTransaction | null => {
      return state.stockData[symbol] || null;
    },
    [state.stockData]
  );

  // 특정 종목 데이터 삭제
  const removeStockData = useCallback((symbol: string) => {
    dispatch({ type: "REMOVE_STOCK_DATA", payload: symbol });
  }, []);

  // 실시간 서비스 초기화
  useEffect(() => {
    if (!isAuthenticated || isLoading || isInitializedRef.current) return;

    const initializeService = async () => {
      await startRealTimeService();
    };

    initializeService();

    // 컴포넌트 언마운트시 정리
    return () => {
      console.log("🧹 [RealtimePriceContext] useEffect cleanup 실행");

      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
        cleanupFunctionRef.current = null;
      }

      isInitializedRef.current = false;
      dispatch({ type: "SET_CONNECTED", payload: false });
    };
  }, [isAuthenticated, isLoading, startRealTimeService]);

  const actions = useMemo(
    () => ({
      getStockData,
      removeStockData,
    }),
    [getStockData, removeStockData]
  );

  return (
    <RealtimePriceStateContext.Provider value={state}>
      <RealtimePriceActionsContext.Provider value={actions}>
        {children}
      </RealtimePriceActionsContext.Provider>
    </RealtimePriceStateContext.Provider>
  );
};

export const useRealtimePriceState = () => {
  const context = useContext(RealtimePriceStateContext);
  if (context === undefined) {
    throw new Error(
      "useRealtimePriceState must be used within a RealtimePriceProvider"
    );
  }
  return context;
};

export const useRealtimePriceActions = () => {
  const context = useContext(RealtimePriceActionsContext);
  if (context === undefined) {
    throw new Error(
      "useRealtimePriceActions must be used within a RealtimePriceProvider"
    );
  }
  return context;
};

export const useRealtimePrice = () => {
  return {
    ...useRealtimePriceState(),
    ...useRealtimePriceActions(),
  };
};
