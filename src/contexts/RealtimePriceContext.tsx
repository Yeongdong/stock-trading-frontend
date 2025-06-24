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
import {
  RealtimeAction,
  RealtimeCallbacks,
  RealtimePriceContextType,
  RealtimeState,
} from "@/types/domains/realtime/context";
import { StockCode } from "@/types";
import {
  RealtimeStockData,
  ConnectionData,
} from "@/types/domains/realtime/entities";

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
}

const RealtimePriceContext = createContext<
  RealtimePriceContextType | undefined
>(undefined);

export const RealtimePriceProvider: React.FC<{
  children: ReactNode;
  callbacks?: RealtimeCallbacks;
}> = ({ children, callbacks }) => {
  const [state, dispatch] = useReducer(realtimePriceReducer, initialState);
  const isSubscribedRef = useRef(false);

  const handleStockPrice = useCallback(
    (data: RealtimeStockData) => {
      if (!data || !data.symbol || typeof data.price !== "number") {
        return;
      }

      dispatch({
        type: "UPDATE_STOCK_DATA",
        payload: { symbol: data.symbol, data },
      });

      callbacks?.onStockDataUpdate?.(data);
      callbacks?.onChartDataUpdate?.(data);
    },
    [callbacks]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleConnected = useCallback((_data: ConnectionData) => {
    dispatch({ type: "SET_CONNECTED", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
  }, []);

  const getStockData = useCallback(
    (symbol: StockCode): RealtimeStockData | null => {
      return state.stockData[symbol] || null;
    },
    [state.stockData]
  );

  const removeStockData = useCallback((symbol: StockCode) => {
    if (!symbol) return;
    dispatch({ type: "REMOVE_STOCK_DATA", payload: symbol });
  }, []);

  useEffect(() => {
    if (isSubscribedRef.current) return;

    const unsubscribeStockPrice = realtimeSocketService.subscribe(
      "stockPrice",
      handleStockPrice
    );

    const unsubscribeConnected = realtimeSocketService.subscribe(
      "connected",
      handleConnected
    );

    const checkConnection = () => {
      const connectionState = realtimeSocketService.getConnectionState();
      dispatch({
        type: "SET_CONNECTED",
        payload: connectionState === "Connected",
      });
    };

    checkConnection();
    isSubscribedRef.current = true;

    return () => {
      unsubscribeStockPrice();
      unsubscribeConnected();
      isSubscribedRef.current = false;
    };
  }, [handleStockPrice, handleConnected]);

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
