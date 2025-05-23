import React, { memo } from "react";
import { StockPriceCardProps } from "@/types";
import { useStockCardData } from "@/hooks/stock/useStockCardData";
import StockPriceHeader from "./StockPriceHeader";
import PriceDisplay from "./PriceDisplay";
import TradingInfo from "./TradingInfo";
import StockMiniChart from "./StockMiniChart";
import StockCardSkeleton from "./StockCardSkeleton";

const StockPriceCard: React.FC<StockPriceCardProps> = memo(({ symbol }) => {
  const {
    stockData,
    chartData,
    blinkClass,
    isUnsubscribing,
    isLoading,
    handleUnsubscribe,
  } = useStockCardData(symbol);

  if (isLoading || !stockData) {
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
