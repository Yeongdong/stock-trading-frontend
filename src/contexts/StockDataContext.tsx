"use client";

import { StockCode, RealtimeStockData } from "@/types";
import {
  StockDataAction,
  StockDataContextValue,
  StockDataState,
} from "@/types/domains/stock/context";
import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  ReactNode,
  useCallback,
} from "react";

const initialState: StockDataState = {
  stockData: {},
  isLoading: false,
  error: null,
};

// 최대 종목 수 제한
const MAX_STOCK_COUNT = 50;

function stockDataReducer(
  state: StockDataState,
  action: StockDataAction
): StockDataState {
  try {
    switch (action.type) {
      case "SET_STOCK_DATA":
        return {
          ...state,
          stockData: action.payload,
        };

      case "UPDATE_STOCK_DATA": {
        const { symbol, data } = action.payload;

        if (!symbol || !data || typeof data.price !== "number") {
          console.warn("Invalid stock data:", { symbol, data });
          return state;
        }

        // 동일한 데이터인지 체크 (성능 최적화)
        const existingData = state.stockData[symbol];
        if (
          existingData &&
          existingData.price === data.price &&
          existingData.timestamp === data.timestamp
        ) {
          return state;
        }

        const updatedStockData = {
          ...state.stockData,
          [symbol]: data,
        };

        // 최대 종목 수 제한
        const stockSymbols = Object.keys(updatedStockData);
        if (stockSymbols.length > MAX_STOCK_COUNT) {
          // 가장 오래된 데이터 제거
          const sortedSymbols = stockSymbols.sort((a, b) => {
            const timeA = new Date(updatedStockData[a].timestamp).getTime();
            const timeB = new Date(updatedStockData[b].timestamp).getTime();
            return timeA - timeB;
          });

          const symbolsToRemove = sortedSymbols.slice(
            0,
            stockSymbols.length - MAX_STOCK_COUNT
          );
          symbolsToRemove.forEach((symbolToRemove) => {
            delete updatedStockData[symbolToRemove];
          });
        }

        return {
          ...state,
          stockData: updatedStockData,
        };
      }

      case "REMOVE_STOCK_DATA": {
        const symbol = action.payload;
        if (!symbol || !state.stockData[symbol]) return state;

        const newStockData = { ...state.stockData };
        delete newStockData[symbol];

        return {
          ...state,
          stockData: newStockData,
        };
      }

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
  } catch (error) {
    console.error("Stock data reducer error:", error);
    return state;
  }
}

const StockDataContext = createContext<StockDataContextValue | undefined>(
  undefined
);

export const StockDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(stockDataReducer, initialState);

  // 주식 데이터 업데이트
  const updateStockData = useCallback((stockData: RealtimeStockData) => {
    try {
      if (
        !stockData ||
        !stockData.symbol ||
        typeof stockData.price !== "number"
      ) {
        console.warn("Invalid stock data for update:", stockData);
        return;
      }

      dispatch({
        type: "UPDATE_STOCK_DATA",
        payload: { symbol: stockData.symbol, data: stockData },
      });
    } catch (error) {
      console.error("Stock data update error:", error);
    }
  }, []);

  // 주식 데이터 제거
  const removeStockData = useCallback((symbol: StockCode) => {
    try {
      if (!symbol || typeof symbol !== "string") {
        console.warn("Invalid symbol for stock data removal:", symbol);
        return;
      }

      dispatch({ type: "REMOVE_STOCK_DATA", payload: symbol });
    } catch (error) {
      console.error("Stock data removal error:", error);
    }
  }, []);

  // 특정 종목 데이터 조회
  const getStockData = useCallback(
    (symbol: StockCode): RealtimeStockData | null => {
      try {
        if (!symbol || typeof symbol !== "string") return null;

        return state.stockData[symbol] || null;
      } catch (error) {
        console.error("Get stock data error:", error);
        return null;
      }
    },
    [state.stockData]
  );

  // 모든 주식 데이터 제거
  const clearAllStockData = useCallback(() => {
    try {
      dispatch({ type: "SET_STOCK_DATA", payload: {} });
    } catch (error) {
      console.error("Clear all stock data error:", error);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      stockData: state.stockData,
      isLoading: state.isLoading,
      error: state.error,
      updateStockData,
      removeStockData,
      getStockData,
      clearAllStockData,
    }),
    [
      state.stockData,
      state.isLoading,
      state.error,
      updateStockData,
      removeStockData,
      getStockData,
      clearAllStockData,
    ]
  );

  return (
    <StockDataContext.Provider value={contextValue}>
      {children}
    </StockDataContext.Provider>
  );
};

export const useStockData = (): StockDataContextValue => {
  const context = useContext(StockDataContext);
  if (context === undefined)
    throw new Error("useStockData must be used within a StockDataProvider");

  return context;
};
