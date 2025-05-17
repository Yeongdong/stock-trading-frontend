import { useState, useEffect, useCallback } from "react";
import { StockTransaction, PriceDataPoint, StockCardDataResult } from "@/types";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import { TIMINGS, ANIMATIONS } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { ERROR_MESSAGES } from "@/constants";

export const useStockCardData = (symbol: string): StockCardDataResult => {
  const { getStockData, getChartData, unsubscribeSymbol } =
    useStockOperations();
  const { addError } = useError();

  const [stockData, setStockData] = useState<StockTransaction | null>(null);
  const [chartData, setChartData] = useState<PriceDataPoint[]>([]);
  const [blinkClass, setBlinkClass] = useState<string>("");
  const [isUnsubscribing, setIsUnsubscribing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 차트 데이터가 변경된 경우에만 실행
  useEffect(() => {
    const latestChartData = getChartData(symbol);
    if (JSON.stringify(latestChartData) !== JSON.stringify(chartData)) {
      setChartData(latestChartData);
    }
  }, [symbol, getChartData, chartData]);

  // 주식 데이터를 주기적으로 업데이트
  useEffect(() => {
    const intervalId = setInterval(() => {
      const latestData = getStockData(symbol);
      if (latestData && (!stockData || stockData.price !== latestData.price)) {
        if (stockData && latestData.price !== stockData.price) {
          const newClass =
            latestData.price > stockData.price ? "blink-up" : "blink-down";
          setBlinkClass(newClass);

          // 효과 초기화를 위한 타이머
          setTimeout(() => {
            setBlinkClass("");
          }, ANIMATIONS.BLINK_DURATION);
        }

        setStockData(latestData);
        setIsLoading(false);
      }
    }, TIMINGS.STOCK_PRICE_CHECK_INTERVAL);

    // 초기 데이터 로드
    setStockData(getStockData(symbol));
    if (getStockData(symbol)) {
      setIsLoading(false);
    }

    return () => clearInterval(intervalId);
  }, [symbol, getStockData, stockData]);

  // 구독 해제 핸들러
  const handleUnsubscribe = useCallback(async () => {
    try {
      setIsUnsubscribing(true);
      await unsubscribeSymbol(symbol);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      addError({
        message: ERROR_MESSAGES.REALTIME.UNSUBSCRIBE_FAIL(symbol),
        severity: "error",
      });
    } finally {
      setIsUnsubscribing(false);
    }
  }, [unsubscribeSymbol, symbol, addError]);

  return {
    stockData,
    chartData,
    blinkClass,
    isUnsubscribing,
    isLoading,
    handleUnsubscribe,
  };
};
