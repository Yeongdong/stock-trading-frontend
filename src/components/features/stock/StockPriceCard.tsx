import React, { useEffect, useState, useCallback, memo } from "react";
import { StockTransaction } from "@/types";
import { useStockData } from "@/contexts/StockDataContext";
import { useError } from "@/contexts/ErrorContext";
import StockPriceHeader from "./StockPriceHeader";
import PriceDisplay from "./PriceDisplay";
import TradingInfo from "./TradingInfo";
import StockMiniChart from "./StockMiniChart";
import { TIMINGS, ANIMATIONS, ERROR_MESSAGES } from "@/constants";

interface StockPriceCardProps {
  symbol: string;
}

const StockPriceCard: React.FC<StockPriceCardProps> = memo(({ symbol }) => {
  const { getStockData, unsubscribeSymbol } = useStockData();
  const { addError } = useError();
  const [stockData, setStockData] = useState<StockTransaction | null>(null);
  const [blinkClass, setBlinkClass] = useState<string>("");
  const [isUnsubscribing, setIsUnsubscribing] = useState<boolean>(false);

  // 구독 취소 처리
  const handleUnsubscribe = useCallback(async () => {
    try {
      setIsUnsubscribing(true);
      await unsubscribeSymbol(symbol);
    } catch (error) {
      console.error(error);
      addError({
        message: ERROR_MESSAGES.REALTIME.UNSUBSCRIBE_FAIL(symbol),
        severity: "error",
      });
    } finally {
      setIsUnsubscribing(false);
    }
  }, [symbol, unsubscribeSymbol, addError]);

  // 실시간 데이터 업데이트 감지
  useEffect(() => {
    let isMounted = true;

    const updateStockData = () => {
      if (!isMounted) return;

      const latestData = getStockData(symbol);
      if (!latestData) return;

      if (
        !stockData ||
        JSON.stringify(latestData) !== JSON.stringify(stockData)
      ) {
        const priceChanged = stockData && latestData.price !== stockData.price;

        if (priceChanged) {
          // 가격 상승/하락에 따른 깜빡임 효과 설정
          const newClass =
            latestData.price > stockData.price ? "blink-up" : "blink-down";
          setBlinkClass(newClass);

          // 효과 초기화를 위한 타이머
          setTimeout(() => {
            if (isMounted) {
              setBlinkClass("");
            }
          }, ANIMATIONS.BLINK_DURATION);
        }

        setStockData(latestData);
      }
    };

    const intervalId = setInterval(
      updateStockData,
      TIMINGS.STOCK_PRICE_CHECK_INTERVAL
    );
    updateStockData(); // 초기 데이터 로드

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [symbol, stockData, getStockData]);

  if (!stockData) {
    return (
      <div className="stock-card loading">
        <div className="stock-symbol">{symbol}</div>
        <div className="loading-indicator">데이터 로딩중...</div>
      </div>
    );
  }

  return (
    <div className={`stock-card ${blinkClass}`}>
      <StockPriceHeader
        symbol={symbol}
        name={stockData.symbol}
        isUnsubscribing={isUnsubscribing}
        onUnsubscribe={handleUnsubscribe}
      />

      <PriceDisplay
        price={stockData.price}
        priceChange={stockData.priceChange}
        changeRate={stockData.changeRate}
      />

      <div className="chart-container">
        <StockMiniChart symbol={symbol} />
      </div>

      <TradingInfo
        volume={stockData.volume}
        time={new Date(stockData.transactionTime).toLocaleTimeString()}
      />
    </div>
  );
});

StockPriceCard.displayName = "StockPriceCard";

export default StockPriceCard;
