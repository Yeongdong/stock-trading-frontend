"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { PriceDataPoint, RealtimeStockData } from "@/types";
import { LIMITS } from "@/constants";
import {
  ChartDataAction,
  ChartDataContextType,
  ChartDataState,
} from "@/types/domains/realtime/context";

const initialState: ChartDataState = {};

function chartDataReducer(
  state: ChartDataState,
  action: ChartDataAction
): ChartDataState {
  try {
    switch (action.type) {
      case "UPDATE_CHART_DATA": {
        const { symbol, dataPoint } = action.payload;

        if (!symbol || !dataPoint || typeof dataPoint.price !== "number") {
          console.warn("Invalid chart data:", { symbol, dataPoint });
          return state;
        }

        const currentData = state[symbol] || [];

        // 마지막 데이터와 같으면 상태 변경 없음 (성능 최적화)
        const lastPoint = currentData[currentData.length - 1];
        if (
          lastPoint &&
          lastPoint.price === dataPoint.price &&
          lastPoint.time === dataPoint.time
        ) {
          return state;
        }

        // 최대 데이터 포인트 수 제한으로 메모리 관리
        const updatedData = [...currentData, dataPoint].slice(
          -LIMITS.MAX_CHART_DATA_POINTS
        );

        return {
          ...state,
          [symbol]: updatedData,
        };
      }

      case "REMOVE_CHART_DATA": {
        const symbol = action.payload;
        if (!symbol || !state[symbol]) return state;

        const newState = { ...state };
        delete newState[symbol];
        return newState;
      }

      case "CLEAR_ALL_CHART_DATA":
        return {};

      default:
        return state;
    }
  } catch (error) {
    console.error("Chart data reducer error:", error);
    return state;
  }
}

const ChartDataContext = createContext<ChartDataContextType | undefined>(
  undefined
);

export const ChartDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [chartData, dispatch] = useReducer(chartDataReducer, initialState);

  const updateChartData = useCallback((stockData: RealtimeStockData) => {
    try {
      if (
        !stockData ||
        !stockData.symbol ||
        typeof stockData.price !== "number"
      ) {
        console.warn("Invalid stock data for chart update:", stockData);
        return;
      }

      const symbol = stockData.symbol;
      const dataPoint: PriceDataPoint = {
        time: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        price: stockData.price,
      };

      dispatch({
        type: "UPDATE_CHART_DATA",
        payload: { symbol, dataPoint },
      });
    } catch (error) {
      console.error("Chart data update error:", error);
    }
  }, []);

  const removeChartData = useCallback((symbol: string) => {
    try {
      if (!symbol || typeof symbol !== "string") {
        console.warn("Invalid symbol for chart data removal:", symbol);
        return;
      }

      dispatch({ type: "REMOVE_CHART_DATA", payload: symbol });
    } catch (error) {
      console.error("Chart data removal error:", error);
    }
  }, []);

  const clearAllChartData = useCallback(() => {
    try {
      dispatch({ type: "CLEAR_ALL_CHART_DATA" });
    } catch (error) {
      console.error("Chart data clear error:", error);
    }
  }, []);

  const getChartData = useCallback(
    (symbol: string): PriceDataPoint[] => {
      try {
        if (!symbol || typeof symbol !== "string") return [];

        return chartData[symbol] || [];
      } catch (error) {
        console.error("Error getting chart data:", error);
        return [];
      }
    },
    [chartData]
  );

  const contextValue = useMemo(
    () => ({
      chartData,
      updateChartData,
      removeChartData,
      clearAllChartData,
      getChartData,
    }),
    [
      chartData,
      updateChartData,
      removeChartData,
      clearAllChartData,
      getChartData,
    ]
  );

  return (
    <ChartDataContext.Provider value={contextValue}>
      {children}
    </ChartDataContext.Provider>
  );
};

export const useChartData = (): ChartDataContextType => {
  const context = useContext(ChartDataContext);
  if (context === undefined)
    throw new Error("useChartData must be used within a ChartDataProvider");

  return context;
};
