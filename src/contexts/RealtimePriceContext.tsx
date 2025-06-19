// src/contexts/RealtimePriceContext.tsx

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

import { ERROR_MESSAGES } from "@/constants";
import {
  RealtimeAction,
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

interface RealtimePriceActions {
  getStockData: (symbol: StockCode) => RealtimeStockData | null;
  removeStockData: (symbol: StockCode) => void;
}

interface ContextUpdaters {
  updateStockData: (stockData: RealtimeStockData) => void;
  updateChartData: (stockData: RealtimeStockData) => void;
}

const RealtimePriceStateContext = createContext<RealtimeState | undefined>(
  undefined
);
const RealtimePriceActionsContext = createContext<
  RealtimePriceActions | undefined
>(undefined);

export const RealtimePriceProvider: React.FC<{
  children: ReactNode;
  contextUpdaters?: ContextUpdaters;
}> = ({ children, contextUpdaters }) => {
  const [state, dispatch] = useReducer(realtimePriceReducer, initialState);
  const { addError } = useError();
  const { isAuthenticated, isLoading } = useAuthContext();

  const isInitializedRef = useRef<boolean>(false);
  const cleanupFunctionRef = useRef<(() => void) | null>(null);
  const updatersRef = useRef<ContextUpdaters | undefined>(contextUpdaters);

  useEffect(() => {
    updatersRef.current = contextUpdaters;
  }, [contextUpdaters]);

  // 타입 수정: RealtimeStockData로 변경
  const handleStockPrice = useCallback((data: RealtimeStockData) => {
    dispatch({
      type: "UPDATE_STOCK_DATA",
      payload: { symbol: data.symbol, data },
    });

    const updaters = updatersRef.current;
    if (updaters) {
      updaters.updateStockData(data);
      updaters.updateChartData(data);
    }
  }, []);

  const startRealTimeService = useCallback(async () => {
    if (!isAuthenticated) return false;
    if (state.isConnected && isInitializedRef.current) return true;

    const response = await realtimeApiService.startRealTimeService();
    if (response.error) throw new Error(response.error);

    realtimeSocketService.setErrorCallback((errorMessage) => {
      addError({
        message: errorMessage,
        severity: "error",
      });
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

      addError({
        message: ERROR_MESSAGES.REALTIME.SERVICE_START,
        severity: "info",
      });

      return true;
    } else {
      throw new Error("SignalR 연결 실패");
    }
  }, [isAuthenticated, state.isConnected, handleStockPrice, addError]);

  const getStockData = useCallback(
    (symbol: StockCode): RealtimeStockData | null => {
      return state.stockData[symbol] || null;
    },
    [state.stockData]
  );

  const removeStockData = useCallback((symbol: StockCode) => {
    dispatch({ type: "REMOVE_STOCK_DATA", payload: symbol });
  }, []);

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
