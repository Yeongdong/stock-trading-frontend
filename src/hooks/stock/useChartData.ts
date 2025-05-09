import { useState, useCallback } from "react";
import { LIMITS } from "@/constants";
import { StockTransaction } from "@/types";

// 차트 데이터 포인트 인터페이스
export interface PriceDataPoint {
  time: string;
  price: number;
}

// 차트 데이터 상태 인터페이스
export interface ChartDataState {
  [symbol: string]: PriceDataPoint[];
}

export const useChartData = () => {
  const [chartData, setChartData] = useState<ChartDataState>({});

  // 차트 데이터 업데이트
  const updateChartData = useCallback((data: StockTransaction) => {
    setChartData((prevChartData) => {
      const symbol = data.symbol;
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        price: data.price,
      };

      const currentData = prevChartData[symbol] || [];

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
  }, []);

  return {
    chartData,
    updateChartData,
    getChartData,
    removeChartData,
  };
};
