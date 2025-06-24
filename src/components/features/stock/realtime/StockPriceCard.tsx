import React, { memo, useMemo } from "react";
import { useStockCardData } from "@/hooks/stock/useStockCardData";
import StockPriceHeader from "./components/StockPriceHeader";
import PriceDisplay from "./components/StockPriceDisplay";
import TradingInfo from "./components/StockTradingInfo";
import StockMiniChart from "../chart/StockMiniChart";
import StockCardSkeleton from "../common/StockCardSkeleton";
import styles from "./StockPriceCard.module.css";
import { StockPriceCardProps } from "@/types";

const StockPriceCard: React.FC<StockPriceCardProps> = memo(({ symbol }) => {
  const {
    stockData,
    chartData,
    blinkClass,
    isUnsubscribing,
    isLoading,
    handleUnsubscribe,
  } = useStockCardData(symbol);

  const blinkClassName = useMemo(() => {
    const classMap = {
      "blink-up": styles.blinkUp,
      "blink-down": styles.blinkDown,
    } as const;

    return classMap[blinkClass as keyof typeof classMap] || "";
  }, [blinkClass]);

  if (isLoading || !stockData) return <StockCardSkeleton symbol={symbol} />;

  const { name = symbol, volume, timestamp } = stockData;

  return (
    <div className={`${styles.stockCard} ${blinkClassName}`}>
      <StockPriceHeader
        symbol={symbol}
        name={name !== symbol ? name : undefined}
        isUnsubscribing={isUnsubscribing}
        onUnsubscribe={handleUnsubscribe}
      />

      <PriceDisplay symbol={symbol} />

      <div className={styles.chartContainer}>
        <StockMiniChart symbol={symbol} data={chartData} />
      </div>

      <TradingInfo
        volume={volume}
        time={new Date(timestamp).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      />
    </div>
  );
});

StockPriceCard.displayName = "StockPriceCard";

export default StockPriceCard;
