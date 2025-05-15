"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
  useRef,
} from "react";
import { LIMITS } from "@/constants";
import { useRealtimePrice } from "./RealtimePriceContext";
import {
  PriceDataPoint,
  ChartDataState,
  ChartDataContextType,
} from "@/types/contexts/stockData";

const ChartDataContext = createContext<ChartDataContextType | undefined>(
  undefined
);

export const ChartDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [chartData, setChartData] = useState<ChartDataState>({});
  const { stockData } = useRealtimePrice();

  // 마지막 업데이트 시간과 값을 추적하는 참조
  const lastUpdatesRef = useRef<
    Record<string, { time: number; price: number }>
  >({});

  // 특정 종목의 차트 데이터 가져오기
  const getChartData = useCallback(
    (symbol: string): PriceDataPoint[] => {
      return chartData[symbol] || [];
    },
    [chartData]
  );

  // 특정 종목의 차트 데이터 삭제
  const removeChartData = useCallback((symbol: string) => {
    setChartData((prevChartData) => {
      const newChartData = { ...prevChartData };
      delete newChartData[symbol];
      return newChartData;
    });

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
    let hasChanges = false;
    const updates: Record<string, PriceDataPoint[]> = {};

    // 각 종목에 대해 처리
    Object.entries(stockData).forEach(([symbol, data]) => {
      // 마지막 업데이트 정보 가져오기
      const lastUpdate = lastUpdatesRef.current[symbol] || {
        time: 0,
        price: 0,
      };

      // 최소 업데이트 간격을 지키고, 가격이 변경된 경우에만 업데이트
      if (
        currentTime - lastUpdate.time >= MIN_UPDATE_INTERVAL &&
        data.price !== lastUpdate.price
      ) {
        // 마지막 업데이트 정보 갱신
        lastUpdatesRef.current[symbol] = {
          time: currentTime,
          price: data.price,
        };

        // 새 데이터 포인트 생성
        const newDataPoint = {
          time: new Date().toLocaleTimeString(),
          price: data.price,
        };

        // 현재 차트 데이터 가져오기
        const currentData = chartData[symbol] || [];

        // 최대 길이 제한을 유지하면서 새 데이터 추가
        updates[symbol] = [...currentData, newDataPoint].slice(
          -LIMITS.MAX_CHART_DATA_POINTS
        );

        hasChanges = true;
      }
    });

    // 변경 사항이 있는 경우에만 상태 업데이트
    if (hasChanges) {
      setChartData((prevData) => ({
        ...prevData,
        ...updates,
      }));
    }
  }, [stockData, chartData]);

  const contextValue = useMemo(
    () => ({
      getChartData,
      removeChartData,
    }),
    [getChartData, removeChartData]
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
