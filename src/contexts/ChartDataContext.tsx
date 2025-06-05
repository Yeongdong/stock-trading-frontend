"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  PriceDataPoint,
  StockTransaction,
  ChartDataState,
  ChartDataAction,
  ChartDataContextType,
} from "@/types";
import { LIMITS } from "@/constants";

const initialState: ChartDataState = {
  chartData: {},
};

function chartDataReducer(
  state: ChartDataState,
  action: ChartDataAction
): ChartDataState {
  switch (action.type) {
    case "UPDATE_CHART_DATA": {
      const { symbol, dataPoint } = action.payload;
      const currentData = state.chartData[symbol] || [];

      // 마지막 데이터와 같으면 상태 변경 없음
      const lastPoint = currentData[currentData.length - 1];
      if (lastPoint && lastPoint.price === dataPoint.price) return state;

      // 최대 데이터 포인트 수 제한
      const updatedData = [...currentData, dataPoint].slice(
        -LIMITS.MAX_CHART_DATA_POINTS
      );

      return {
        ...state,
        chartData: {
          ...state.chartData,
          [symbol]: updatedData,
        },
      };
    }
    case "REMOVE_CHART_DATA": {
      const newChartData = { ...state.chartData };
      delete newChartData[action.payload];
      return {
        ...state,
        chartData: newChartData,
      };
    }
    case "CLEAR_ALL_CHART_DATA":
      return {
        ...state,
        chartData: {},
      };
    default:
      return state;
  }
}

const ChartDataContext = createContext<ChartDataContextType | undefined>(
  undefined
);

export const ChartDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(chartDataReducer, initialState);

  // 차트 데이터 업데이트 함수
  const updateChartData = useCallback((stockData: StockTransaction) => {
    const symbol = stockData.symbol;
    const dataPoint: PriceDataPoint = {
      time: new Date().toLocaleTimeString(),
      price: stockData.price,
    };

    dispatch({
      type: "UPDATE_CHART_DATA",
      payload: { symbol, dataPoint },
    });
  }, []);

  // 차트 데이터 제거 함수
  const removeChartData = useCallback((symbol: string) => {
    dispatch({ type: "REMOVE_CHART_DATA", payload: symbol });
  }, []);

  // 모든 차트 데이터 초기화
  const clearAllChartData = useCallback(() => {
    dispatch({ type: "CLEAR_ALL_CHART_DATA" });
  }, []);

  // 특정 종목의 차트 데이터 조회
  const getChartData = useCallback(
    (symbol: string): PriceDataPoint[] => {
      return state.chartData[symbol] || [];
    },
    [state.chartData]
  );

  const contextValue = useMemo(
    () => ({
      chartData: state.chartData,
      updateChartData,
      removeChartData,
      clearAllChartData,
      getChartData,
    }),
    [
      state.chartData,
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

export const useChartData = () => {
  const context = useContext(ChartDataContext);
  if (context === undefined) {
    throw new Error("useChartData must be used within a ChartDataProvider");
  }
  return context;
};
