import { useState, useEffect, useCallback } from "react";
import { RealtimeStockData, StockCardDataResult } from "@/types";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import { TIMINGS, ANIMATIONS } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { ERROR_MESSAGES } from "@/constants";

export const useStockCardData = (symbol: string): StockCardDataResult => {
  const { getStockData, getChartData, unsubscribeSymbol } =
    useStockOperations();
  const { addError } = useError();

  const [stockData, setStockData] = useState<RealtimeStockData | null>(null);
  const [blinkClass, setBlinkClass] = useState<string>("");
  const [isUnsubscribing, setIsUnsubscribing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 주식 데이터를 주기적으로 체크하면서 실시간 업데이트 반영
  useEffect(() => {
    const checkForUpdates = () => {
      const latestData = getStockData(symbol);

      if (latestData) {
        const hasChanged =
          !stockData ||
          stockData.price !== latestData.price ||
          stockData.transactionTime !== latestData.transactionTime;

        if (hasChanged) {
          // 가격 변화 애니메이션
          if (stockData && latestData.price !== stockData.price) {
            const newClass =
              latestData.price > stockData.price ? "blink-up" : "blink-down";
            setBlinkClass(newClass);
            setTimeout(() => setBlinkClass(""), ANIMATIONS.BLINK_DURATION);
          }

          setStockData(latestData);
          setIsLoading(false);
        }
      }
    };

    // 즉시 체크
    checkForUpdates();

    // 주기적으로 체크
    const intervalId = setInterval(
      checkForUpdates,
      TIMINGS.STOCK_PRICE_CHECK_INTERVAL
    );

    return () => clearInterval(intervalId);
  }, [symbol, getStockData, stockData]);

  // 초기 로딩 상태 관리
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!stockData) setIsLoading(false);
    }, 5000); // 5초 후 로딩 상태 해제

    return () => clearTimeout(timeoutId);
  }, [stockData, symbol]);

  // 구독 해제
  const handleUnsubscribe = useCallback(async () => {
    try {
      setIsUnsubscribing(true);
      await unsubscribeSymbol(symbol);
    } catch (error) {
      console.error(`구독 해제 실패 (${symbol}):`, error);
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
    chartData: getChartData(symbol),
    blinkClass,
    isUnsubscribing,
    isLoading: isLoading && !stockData,
    handleUnsubscribe,
  };
};
