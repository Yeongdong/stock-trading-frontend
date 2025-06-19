import { useState, useEffect, useCallback } from "react";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import { ANIMATIONS } from "@/constants";
import { RealtimeStockData } from "@/types";
import { RealtimeCardDataResult } from "@/types/domains/realtime/hooks";

export const useStockCardData = (symbol: string): RealtimeCardDataResult => {
  const { getStockData, getChartData, unsubscribeSymbol } =
    useStockOperations();

  const [stockData, setStockData] = useState<RealtimeStockData | null>(null);
  const [blinkClass, setBlinkClass] = useState<string>("");
  const [isUnsubscribing, setIsUnsubscribing] = useState<boolean>(false);

  // 실시간 데이터 업데이트 처리
  useEffect(() => {
    const latestData = getStockData(symbol);

    if (latestData) {
      // 가격 변화 애니메이션
      if (stockData && latestData.price !== stockData.price) {
        const newClass =
          latestData.price > stockData.price ? "blink-up" : "blink-down";
        setBlinkClass(newClass);

        const timeoutId = setTimeout(() => {
          setBlinkClass("");
        }, ANIMATIONS.BLINK_DURATION);

        return () => clearTimeout(timeoutId);
      }

      setStockData(latestData);
    }
  }, [symbol, getStockData, stockData]);

  // 구독 해제
  const handleUnsubscribe = useCallback(async () => {
    setIsUnsubscribing(true);
    try {
      await unsubscribeSymbol(symbol);
    } finally {
      setIsUnsubscribing(false);
    }
  }, [unsubscribeSymbol, symbol]);

  return {
    stockData,
    chartData: getChartData(symbol),
    blinkClass,
    isUnsubscribing,
    isLoading: !stockData,
    handleUnsubscribe,
  };
};
