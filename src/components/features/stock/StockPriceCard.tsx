import React, { memo } from "react";
import { StockPriceCardProps } from "@/types";
import { useStockCardData } from "@/hooks/stock/useStockCardData";
import StockPriceHeader from "./StockPriceHeader";
import PriceDisplay from "./PriceDisplay";
import TradingInfo from "./TradingInfo";
import StockMiniChart from "./StockMiniChart";
import StockCardSkeleton from "./StockCardSkeleton";
import styles from "./StockPriceCard.module.css";

const StockPriceCard: React.FC<StockPriceCardProps> = memo(({ symbol }) => {
  const {
    stockData,
    chartData,
    blinkClass,
    isUnsubscribing,
    isLoading,
    handleUnsubscribe,
  } = useStockCardData(symbol);

  if (isLoading || !stockData) return <StockCardSkeleton symbol={symbol} />;

  const getBlinkClassName = () => {
    switch (blinkClass) {
      case "blink-up":
        return styles.blinkUp;
      case "blink-down":
        return styles.blinkDown;
      default:
        return "";
    }
  };

  return (
    <div className={`${styles.stockCard} ${getBlinkClassName()}`}>
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

      <div className={styles.chartContainer}>
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
