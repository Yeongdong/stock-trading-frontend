import React, { useEffect, useState, useCallback, memo } from "react";
import { StockTransaction, PriceDataPoint, StockPriceCardProps } from "@/types";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import StockPriceHeader from "./StockPriceHeader";
import PriceDisplay from "./PriceDisplay";
import TradingInfo from "./TradingInfo";
import StockMiniChart from "./StockMiniChart";
import StockCardSkeleton from "./StockCardSkeleton";
import { TIMINGS, ANIMATIONS } from "@/constants";

const StockPriceCard = memo(({ symbol }: StockPriceCardProps) => {
  const { getStockData, getChartData, unsubscribeSymbol } =
    useStockOperations();

  const [stockData, setStockData] = useState<StockTransaction | null>(null);
  const [chartData, setChartData] = useState<PriceDataPoint[]>([]);
  const [blinkClass, setBlinkClass] = useState<string>("");
  const [isUnsubscribing, setIsUnsubscribing] = useState<boolean>(false);

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
      }
    }, TIMINGS.STOCK_PRICE_CHECK_INTERVAL);

    setStockData(getStockData(symbol));

    return () => clearInterval(intervalId);
  }, [symbol, getStockData, stockData]);

  const handleUnsubscribe = useCallback(async () => {
    try {
      setIsUnsubscribing(true);
      await unsubscribeSymbol(symbol);
    } finally {
      setIsUnsubscribing(false);
    }
  }, [unsubscribeSymbol, symbol]);

  if (!stockData) {
    return <StockCardSkeleton symbol={symbol} />;
  }

  return (
    <div className={`stock-card ${blinkClass}`}>
      <StockPriceHeader
        symbol={symbol}
        name={stockData.stockName}
        isUnsubscribing={isUnsubscribing}
        onUnsubscribe={handleUnsubscribe}
      />

      <PriceDisplay
        price={stockData.price}
        priceChange={stockData.priceChange}
        changeRate={stockData.changeRate}
      />

      <div className="chart-container">
        <StockMiniChart symbol={symbol} data={chartData} />
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
