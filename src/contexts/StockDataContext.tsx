"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import {
  StockDataAction,
  StockDataState,
  StockDataContextType,
  RealtimeStockData,
} from "@/types";

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

const StockDataContext = createContext<StockDataContextType | undefined>(
  undefined
);

export const StockDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(stockDataReducer, initialState);

  // 주식 데이터 업데이트 함수
  const updateStockData = useCallback(
    (symbol: string, data: RealtimeStockData) => {
      dispatch({ type: "UPDATE_STOCK_DATA", payload: { symbol, data } });
    },
    []
  );

  // 주식 데이터 제거 함수
  const removeStockData = useCallback((symbol: string) => {
    dispatch({ type: "REMOVE_STOCK_DATA", payload: symbol });
  }, []);

  // 특정 종목의 주식 데이터 조회 함수
  const getStockData = useCallback(
    (symbol: string): RealtimeStockData | null => {
      const data = state.stockData[symbol] || null;

      if (data) {
        console.log(
          `📋 [StockDataContext] ${symbol} 데이터 조회 성공:`,
          data.price
        );
      } else {
        console.log(`📋 [StockDataContext] ${symbol} 데이터 없음`);
      }

      return data;
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
