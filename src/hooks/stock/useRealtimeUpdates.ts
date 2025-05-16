import { useState, useEffect } from "react";
import { StockTransaction } from "@/types";
import { useRealtimePrice } from "@/contexts/RealtimePriceContext";
import { TIMINGS, ANIMATIONS } from "@/constants";

export const useRealtimeUpdates = (symbol: string) => {
  const { stockData } = useRealtimePrice();
  const [localStockData, setLocalStockData] = useState<StockTransaction | null>(
    null
  );
  const [blinkClass, setBlinkClass] = useState<string>("");

  // 실시간 데이터 업데이트 처리
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const updateStockData = () => {
      if (!isMounted) return;

      const latestData = stockData[symbol];
      if (!latestData) return;

      // 데이터 변경 감지
      if (
        !localStockData ||
        JSON.stringify(latestData) !== JSON.stringify(localStockData)
      ) {
        const priceChanged =
          localStockData && latestData.price !== localStockData.price;

        if (priceChanged) {
          // 가격 상승/하락에 따른 깜빡임 효과 설정
          const newClass =
            latestData.price > localStockData.price ? "blink-up" : "blink-down";
          setBlinkClass(newClass);

          // 효과 초기화 타이머
          timeoutId = setTimeout(() => {
            if (isMounted) {
              setBlinkClass("");
            }
          }, ANIMATIONS.BLINK_DURATION);
        }

        setLocalStockData(latestData);
      }
    };

    // 주기적 업데이트를 위한 interval 설정
    const intervalId = setInterval(
      updateStockData,
      TIMINGS.STOCK_PRICE_CHECK_INTERVAL
    );

    // 초기 데이터 로드
    updateStockData();

    // 정리 함수
    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [symbol, localStockData, stockData]);

  return {
    stockData: localStockData,
    blinkClass,
  };
};
