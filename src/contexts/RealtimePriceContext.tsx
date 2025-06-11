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
  RealtimeStockData,
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

interface ContextUpdaters {
  updateStockData: (symbol: string, data: RealtimeStockData) => void;
  updateChartData: (data: RealtimeStockData) => void;
}

export const RealtimePriceProvider: React.FC<{
  children: ReactNode;
  contextUpdaters?: ContextUpdaters;
}> = ({ children, contextUpdaters }) => {
  const [state, dispatch] = useReducer(realtimePriceReducer, initialState);
  const { addError } = useError();
  const { isAuthenticated, isLoading } = useAuth();

  const isInitializedRef = useRef<boolean>(false);
  const cleanupFunctionRef = useRef<(() => void) | null>(null);
  const updatersRef = useRef<ContextUpdaters | undefined>(contextUpdaters);

  useEffect(() => {
    updatersRef.current = contextUpdaters;
  }, [contextUpdaters]);

  const handleStockPrice = useCallback((data: RealtimeStockData) => {
    dispatch({
      type: "UPDATE_STOCK_DATA",
      payload: { symbol: data.symbol, data },
    });

    const updaters = updatersRef.current;
    if (updaters) {
      updaters.updateStockData(data.symbol, data);
      updaters.updateChartData(data);
    }
  }, []);

  const startRealTimeService = useCallback(async () => {
    if (!isAuthenticated) return false;
    if (state.isConnected && isInitializedRef.current) return true;

    try {
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
    } catch (err) {
      console.error(err);
      addError({
        message: ERROR_MESSAGES.REALTIME.CONNECTION_FAILED,
        severity: "error",
      });
      return false;
    }
  }, [isAuthenticated, state.isConnected, handleStockPrice, addError]);

  const getStockData = useCallback(
    (symbol: string): RealtimeStockData | null => {
      return state.stockData[symbol] || null;
    },
    [state.stockData]
  );

  const removeStockData = useCallback((symbol: string) => {
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
