// src/contexts/ChartDataContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { StockTransaction } from "@/types";
import { LIMITS } from "@/constants";
import { useRealtimePrice } from "./RealtimePriceContext";

// 차트 데이터 포인트 인터페이스
export interface PriceDataPoint {
  time: string;
  price: number;
}

// 차트 데이터 상태 인터페이스
interface ChartDataState {
  [symbol: string]: PriceDataPoint[];
}

// 타입 정의
interface ChartDataContextType {
  getChartData: (symbol: string) => PriceDataPoint[];
  removeChartData: (symbol: string) => void;
}

// Context 생성
const ChartDataContext = createContext<ChartDataContextType | undefined>(
  undefined
);

// Provider 컴포넌트
export const ChartDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [chartData, setChartData] = useState<ChartDataState>({});
  const { stockData } = useRealtimePrice();

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

  // 주가 데이터가 변경될 때 차트 데이터 업데이트
  useEffect(() => {
    Object.values(stockData).forEach((data) => {
      updateChartData(data);
    });
  }, [stockData, updateChartData]);

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

  // Context 값 메모이제이션
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
