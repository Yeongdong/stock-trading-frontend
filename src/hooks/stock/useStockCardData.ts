import { useState, useEffect, useCallback } from "react";
import { StockTransaction, StockCardDataResult } from "@/types";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import { TIMINGS, ANIMATIONS } from "@/constants";
import { useError } from "@/contexts/ErrorContext";
import { ERROR_MESSAGES } from "@/constants";

export const useStockCardData = (symbol: string): StockCardDataResult => {
  const { getStockData, getChartData, unsubscribeSymbol } =
    useStockOperations();
  const { addError } = useError();

  const [stockData, setStockData] = useState<StockTransaction | null>(null);
  const [blinkClass, setBlinkClass] = useState<string>("");
  const [isUnsubscribing, setIsUnsubscribing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 주식 데이터를 주기적으로 체크하면서 실시간 업데이트 반영
  useEffect(() => {
    const checkForUpdates = () => {
      const latestData = getStockData(symbol);

      if (latestData) {
        console.log(`📊 [useStockCardData] ${symbol} 최신 데이터 확인:`, {
          price: latestData.price,
          change: latestData.priceChange,
          time: latestData.transactionTime,
          previousPrice: stockData?.price,
        });

        // 데이터가 변경되었는지 확인
        const hasChanged =
          !stockData ||
          stockData.price !== latestData.price ||
          stockData.transactionTime !== latestData.transactionTime;

        if (hasChanged) {
          console.log(`🔄 [useStockCardData] ${symbol} 데이터 업데이트됨`);

          // 가격 변화 애니메이션
          if (stockData && latestData.price !== stockData.price) {
            const newClass =
              latestData.price > stockData.price ? "blink-up" : "blink-down";
            setBlinkClass(newClass);

            console.log(
              `💫 [useStockCardData] ${symbol} 애니메이션:`,
              newClass
            );

            setTimeout(() => setBlinkClass(""), ANIMATIONS.BLINK_DURATION);
          }

          setStockData(latestData);
          setIsLoading(false);
        }
      } else if (!stockData) {
        console.log(`⏳ [useStockCardData] ${symbol} 데이터 대기 중...`);
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
      if (!stockData) {
        console.log(`⚠️ [useStockCardData] ${symbol} 데이터 로딩 타임아웃`);
        setIsLoading(false);
      }
    }, 5000); // 5초 후 로딩 상태 해제

    return () => clearTimeout(timeoutId);
  }, [stockData, symbol]);

  // 구독 해제
  const handleUnsubscribe = useCallback(async () => {
    try {
      setIsUnsubscribing(true);
      console.log(`🚫 [useStockCardData] ${symbol} 구독 해제 시작`);

      await unsubscribeSymbol(symbol);

      console.log(`✅ [useStockCardData] ${symbol} 구독 해제 완료`);
    } catch (error) {
      console.error(`❌ [useStockCardData] ${symbol} 구독 해제 실패:`, error);
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
