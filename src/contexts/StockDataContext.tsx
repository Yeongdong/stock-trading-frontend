"use client";

import { StockCode, RealtimeStockData } from "@/types";
import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  ReactNode,
  useCallback,
} from "react";

interface StockDataState {
  readonly stockData: Record<StockCode, RealtimeStockData>;
  readonly isLoading: boolean;
  readonly error: string | null;
}

type StockDataAction =
  | { type: "SET_STOCK_DATA"; payload: Record<StockCode, RealtimeStockData> }
  | {
      type: "UPDATE_STOCK_DATA";
      payload: { symbol: StockCode; data: RealtimeStockData };
    }
  | { type: "REMOVE_STOCK_DATA"; payload: StockCode }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: StockDataState = {
  stockData: {},
  isLoading: false,
  error: null,
};

function stockDataReducer(
  state: StockDataState,
  action: StockDataAction
): StockDataState {
  switch (action.type) {
    case "SET_STOCK_DATA":
      return {
        ...state,
        stockData: action.payload,
      };
    case "UPDATE_STOCK_DATA":
      return {
        ...state,
        stockData: {
          ...state.stockData,
          [action.payload.symbol]: action.payload.data,
        },
      };
    case "REMOVE_STOCK_DATA":
      const newStockData = { ...state.stockData };
      delete newStockData[action.payload];
      return {
        ...state,
        stockData: newStockData,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}

interface StockDataContextValue {
  stockData: Record<StockCode, RealtimeStockData>;
  isLoading: boolean;
  error: string | null;
  updateStockData: (stockData: RealtimeStockData) => void;
  removeStockData: (symbol: StockCode) => void;
  getStockData: (symbol: StockCode) => RealtimeStockData | null;
}

const StockDataContext = createContext<StockDataContextValue | undefined>(
  undefined
);

export const StockDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(stockDataReducer, initialState);

  // RealtimeStockData를 직접 받도록 수정
  const updateStockData = useCallback((stockData: RealtimeStockData) => {
    dispatch({
      type: "UPDATE_STOCK_DATA",
      payload: { symbol: stockData.symbol, data: stockData },
    });
  }, []);

  const removeStockData = useCallback((symbol: StockCode) => {
    dispatch({ type: "REMOVE_STOCK_DATA", payload: symbol });
  }, []);

  const getStockData = useCallback(
    (symbol: StockCode): RealtimeStockData | null => {
      return state.stockData[symbol] || null;
    },
    [state.stockData]
  );

  const contextValue = useMemo(
    () => ({
      stockData: state.stockData,
      isLoading: state.isLoading,
      error: state.error,
      updateStockData,
      removeStockData,
      getStockData,
    }),
    [
      state.stockData,
      state.isLoading,
      state.error,
      updateStockData,
      removeStockData,
      getStockData,
    ]
  );

  return (
    <StockDataContext.Provider value={contextValue}>
      {children}
    </StockDataContext.Provider>
  );
};

export const useStockData = () => {
  const context = useContext(StockDataContext);
  if (context === undefined) {
    throw new Error("useStockData must be used within a StockDataProvider");
  }
  return context;
};
