"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  ReactNode,
  useRef,
} from "react";
import { LIMITS } from "@/constants";
import {
  PriceDataPoint,
  ChartDataState,
  ChartDataAction,
  ChartDataActions,
} from "@/types/contexts/stockData";
import { useRealtimePriceState } from "./RealtimePriceContext";

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

      // 마지막 데이터 포인트와 동일하면 상태 변경 없음
      const lastPoint = currentData[currentData.length - 1];
      if (lastPoint && lastPoint.price === dataPoint.price) {
        return state;
      }

      // 최대 길이 제한을 유지하면서 새 데이터 추가
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
    default:
      return state;
  }
}

const ChartDataStateContext = createContext<ChartDataState | undefined>(
  undefined
);
const ChartDataActionsContext = createContext<ChartDataActions | undefined>(
  undefined
);

export const ChartDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(chartDataReducer, initialState);
  const { stockData } = useRealtimePriceState();

  // 마지막 업데이트 시간과 값을 추적하는 참조
  const lastUpdatesRef = useRef<
    Record<string, { time: number; price: number }>
  >({});

  // 특정 종목의 차트 데이터 가져오기
  const getChartData = useCallback(
    (symbol: string): PriceDataPoint[] => {
      return state.chartData[symbol] || [];
    },
    [state.chartData]
  );

  // 특정 종목의 차트 데이터 삭제
  const removeChartData = useCallback((symbol: string) => {
    dispatch({ type: "REMOVE_CHART_DATA", payload: symbol });

    // 마지막 업데이트 참조 정리
    const newLastUpdates = { ...lastUpdatesRef.current };
    delete newLastUpdates[symbol];
    lastUpdatesRef.current = newLastUpdates;
  }, []);

  // 주가 데이터가 변경될 때 차트 데이터 업데이트
  useEffect(() => {
    // 너무 빈번한 업데이트를 방지하기 위한 최소 간격(ms)
    const MIN_UPDATE_INTERVAL = 100;
    const currentTime = Date.now();

    // 각 종목에 대해 처리
    Object.entries(stockData).forEach(([symbol, data]) => {
      const lastUpdate = lastUpdatesRef.current[symbol] || {
        time: 0,
        price: 0,
      };

      // 최소 업데이트 간격을 지키고, 가격이 변경된 경우에만 업데이트
      if (
        currentTime - lastUpdate.time >= MIN_UPDATE_INTERVAL &&
        data.price !== lastUpdate.price
      ) {
        lastUpdatesRef.current[symbol] = {
          time: currentTime,
          price: data.price,
        };

        // 새 데이터 포인트 생성
        const newDataPoint: PriceDataPoint = {
          time: new Date().toLocaleTimeString(),
          price: data.price,
        };

        // 차트 데이터 업데이트
        dispatch({
          type: "UPDATE_CHART_DATA",
          payload: { symbol, dataPoint: newDataPoint },
        });
      }
    });
  }, [stockData]);

  const actions = useMemo(
    () => ({
      getChartData,
      removeChartData,
    }),
    [getChartData, removeChartData]
  );

  return (
    <ChartDataStateContext.Provider value={state}>
      <ChartDataActionsContext.Provider value={actions}>
        {children}
      </ChartDataActionsContext.Provider>
    </ChartDataStateContext.Provider>
  );
};

export const useChartDataState = () => {
  const context = useContext(ChartDataStateContext);
  if (context === undefined) {
    throw new Error(
      "useChartDataState must be used within a ChartDataProvider"
    );
  }
  return context;
};

export const useChartDataActions = () => {
  const context = useContext(ChartDataActionsContext);
  if (context === undefined) {
    throw new Error(
      "useChartDataActions must be used within a ChartDataProvider"
    );
  }
  return context;
};

export const useChartData = () => {
  return {
    ...useChartDataState(),
    ...useChartDataActions(),
  };
};
