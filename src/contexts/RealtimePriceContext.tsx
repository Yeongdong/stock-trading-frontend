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
  const { isAuthenticated, isLoading } = useAuth(); // 인증 상태 확인

  const isStartingRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);

  const handleStockPrice = useCallback((data: StockTransaction) => {
    dispatch({
      type: "UPDATE_STOCK_DATA",
      payload: { symbol: data.symbol, data },
    });
  }, []);

  // 실시간 서비스 시작
  const startRealTimeService = useCallback(async () => {
    if (isStartingRef.current || state.isConnected || !isAuthenticated) {
      return state.isConnected;
    }

    isStartingRef.current = true;

    try {
      // 서버측 실시간 서비스 시작
      const response = await realtimeApiService.startRealTimeService();

      if (response.error) {
        throw new Error(response.error);
      }

      // 클라이언트측 WebSocket 연결 시작
      realtimeSocketService.setErrorCallback((errorMessage) => {
        addError({
          message: errorMessage,
          severity: "error",
        });
      });

      const connected = await realtimeSocketService.start();
      dispatch({ type: "SET_CONNECTED", payload: connected });

      if (connected) {
        if (!isInitializedRef.current) {
          addError({
            message: ERROR_MESSAGES.REALTIME.SERVICE_START,
            severity: "info",
          });
          isInitializedRef.current = true;
        }
        dispatch({ type: "SET_ERROR", payload: null });
      } else {
        throw new Error("실시간 데이터 연결 실패");
      }

      return connected;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      dispatch({
        type: "SET_ERROR",
        payload: `실시간 서비스 시작 실패: ${errorMsg}`,
      });
      addError({
        message: ERROR_MESSAGES.REALTIME.CONNECTION_FAILED,
        severity: "error",
      });
      return false;
    } finally {
      isStartingRef.current = false;
    }
  }, [state.isConnected, isAuthenticated, addError]);

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
    let isActive = true;

    if (!isAuthenticated || isLoading) {
      return;
    }

    const initializeRealTimeService = async () => {
      const connected = await startRealTimeService();

      if (connected && isActive) {
        // 구독 이벤트 설정
        const unsubscribe = realtimeSocketService.subscribe(
          "stockPrice",
          handleStockPrice
        );

        return () => {
          unsubscribe();
          if (isActive) {
            realtimeSocketService.stop();
          }
        };
      }
    };

    initializeRealTimeService();

    // 컴포넌트 언마운트시 연결 종료
    return () => {
      isActive = false;
      realtimeSocketService.stop();
    };
  }, [isAuthenticated, isLoading, startRealTimeService, handleStockPrice]);

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
