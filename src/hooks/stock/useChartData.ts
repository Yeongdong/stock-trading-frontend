import { useState, useCallback, useRef, useEffect } from "react";
import { LIMITS } from "@/constants";
import { PriceDataPoint, RealtimeStockData } from "@/types";
import { ChartDataState } from "@/types/domains/realtime/context";

export const useChartData = () => {
  const [chartData, setChartData] = useState<ChartDataState>({});

  const lastUpdatesRef = useRef<Record<string, number>>({});

  // 차트 데이터 업데이트
  const updateChartData = useCallback((data: RealtimeStockData) => {
    const symbol = data.symbol;
    const currentTime = Date.now();

    const MIN_UPDATE_INTERVAL = 100;

    const lastUpdate = lastUpdatesRef.current[symbol] || 0;
    if (currentTime - lastUpdate < MIN_UPDATE_INTERVAL) {
      return;
    }
    setChartData((prevChartData) => {
      const symbol = data.symbol;
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        price: data.price,
      };

      const currentData = prevChartData[symbol] || [];

      const lastPoint = currentData[currentData.length - 1];
      if (lastPoint && lastPoint.price === newDataPoint.price) {
        return prevChartData;
      }

      // 최대 길이 제한
      const updatedData = [...currentData, newDataPoint].slice(
        -LIMITS.MAX_CHART_DATA_POINTS
      );

      return {
        ...prevChartData,
        [symbol]: updatedData,
      };
    });
  }, []);

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

    const newLastUpdates = { ...lastUpdatesRef.current };
    delete newLastUpdates[symbol];
    lastUpdatesRef.current = newLastUpdates;
  }, []);

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 참조 정리
      lastUpdatesRef.current = {};
    };
  }, []);

  return {
    chartData,
    updateChartData,
    getChartData,
    removeChartData,
  };
};
