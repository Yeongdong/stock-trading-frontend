"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import { StockData, StockCode } from "@/types/core/stock";
import { StockDataState, StockDataAction } from "@/types/core/state";

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
  stockData: Record<StockCode, StockData>;
  isLoading: boolean;
  error: string | null;
  updateStockData: (symbol: StockCode, data: StockData) => void;
  removeStockData: (symbol: StockCode) => void;
  getStockData: (symbol: StockCode) => StockData | null;
}

const StockDataContext = createContext<StockDataContextValue | undefined>(
  undefined
);

export const StockDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(stockDataReducer, initialState);

  const updateStockData = useCallback((symbol: StockCode, data: StockData) => {
    dispatch({ type: "UPDATE_STOCK_DATA", payload: { symbol, data } });
  }, []);

  const removeStockData = useCallback((symbol: StockCode) => {
    dispatch({ type: "REMOVE_STOCK_DATA", payload: symbol });
  }, []);

  const getStockData = useCallback(
    (symbol: StockCode): StockData | null => {
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
