import { useState, useCallback } from "react";
import { LIMITS } from "@/constants";
import { PriceDataPoint, RealtimeStockData } from "@/types";
import { ChartDataState } from "@/types/domains/realtime/context";

/**
 * 차트 데이터 관리 훅
 */
export const useChartData = () => {
  const [chartData, setChartData] = useState<ChartDataState>({});

  // 차트 데이터 업데이트
  const updateChartData = useCallback((data: RealtimeStockData) => {
    setChartData((prevChartData) => {
      const symbol = data.symbol;
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        price: data.price,
      };

      const currentData = prevChartData[symbol] || [];

      // 동일한 가격은 스킵
      const lastPoint = currentData[currentData.length - 1];
      if (lastPoint && lastPoint.price === newDataPoint.price)
        return prevChartData;

      // 최대 길이 제한 적용
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
  }, []);

  return {
    chartData,
    updateChartData,
    getChartData,
    removeChartData,
  };
};
