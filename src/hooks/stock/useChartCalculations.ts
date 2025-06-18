import { useMemo } from "react";
import { PriceDataPoint } from "@/types";
import { ChartCalculationResult } from "@/types/domains/realtime/context";

export const useChartCalculations = (
  data: PriceDataPoint[]
): ChartCalculationResult => {
  // 차트 데이터가 충분한지 확인
  const hasData = useMemo(() => data.length > 1, [data.length]);

  // Y축 최소/최대값 계산
  const yDomain = useMemo((): [number, number] => {
    if (!hasData) return [0, 0];

    const prices = data.map((point) => point.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    // 마진 약간 추가(범위의 5%)
    const margin = (max - min) * 0.05;
    return [Math.floor(min - margin), Math.ceil(max + margin)];
  }, [data, hasData]);

  // 시작 가격(첫 번째 데이터 포인트)
  const startPrice = useMemo(
    () => (hasData ? data[0].price : 0),
    [data, hasData]
  );

  // 현재 가격(마지막 데이터 포인트)
  const currentPrice = useMemo(
    () => (hasData ? data[data.length - 1].price : 0),
    [data, hasData]
  );

  // 가격 변화에 따른 선 색상
  const lineColor = useMemo(() => {
    if (!hasData || data.length < 2) return "#ccc";

    if (currentPrice > startPrice) return "#e53935"; // 상승(빨강)
    if (currentPrice < startPrice) return "#2196f3"; // 하락(파랑)
    return "#757575"; // 변동 없음(회색)
  }, [data, startPrice, currentPrice, hasData]);

  // 가격 변화율 계산
  const priceChangePercentage = useMemo(() => {
    if (!hasData || currentPrice === 0 || startPrice === 0) return 0;
    return ((currentPrice - startPrice) / startPrice) * 100;
  }, [currentPrice, startPrice, hasData]);

  // 가격 변화율 클래스
  const priceChangeClass = useMemo(() => {
    if (priceChangePercentage > 0) return "price-up";
    if (priceChangePercentage < 0) return "price-down";
    return "";
  }, [priceChangePercentage]);

  return {
    hasData,
    yDomain,
    startPrice,
    currentPrice,
    lineColor,
    priceChangePercentage,
    priceChangeClass,
  };
};
