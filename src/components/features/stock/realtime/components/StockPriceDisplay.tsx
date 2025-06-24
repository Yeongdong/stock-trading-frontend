import React, { memo, useMemo } from "react";
import { useStockData } from "@/contexts/StockDataContext";
import styles from "./StockPriceDisplay.module.css";
import { PriceDisplayProps } from "@/types";

const PriceDisplay: React.FC<PriceDisplayProps> = memo(
  ({ symbol, className = "" }) => {
    const { getStockData } = useStockData();

    const stockData = useMemo(() => {
      return getStockData(symbol);
    }, [getStockData, symbol]);

    if (!stockData) {
      return (
        <div className={`${styles.priceContainer} ${className}`}>
          <div className={styles.currentPrice}>데이터 로딩 중...</div>
        </div>
      );
    }

    const { price, priceChange, changeRate } = stockData;

    // 가격 변화 방향 결정
    const getPriceChangeClass = () => {
      if (priceChange > 0) return styles.priceUp;
      if (priceChange < 0) return styles.priceDown;
      return styles.priceUnchanged;
    };

    const priceChangeClass = getPriceChangeClass();

    // 변화율 포맷팅
    const formatChangeRate = (rate: number): string => {
      const sign = rate > 0 ? "+" : "";
      return `${sign}${rate.toFixed(2)}%`;
    };

    // 가격 변화 포맷팅
    const formatPriceChange = (change: number): string => {
      const sign = change > 0 ? "+" : "";
      return `${sign}${change.toLocaleString()}`;
    };

    return (
      <div className={`${styles.priceContainer} ${className}`}>
        <div className={`${styles.currentPrice} ${priceChangeClass}`}>
          {price.toLocaleString()}원
        </div>

        <div className={`${styles.priceChange} ${priceChangeClass}`}>
          <span className={styles.changeAmount}>
            {formatPriceChange(priceChange)}원
          </span>
          <span className={styles.changeRate}>
            ({formatChangeRate(changeRate)})
          </span>
        </div>
      </div>
    );
  }
);

PriceDisplay.displayName = "PriceDisplay";

export default PriceDisplay;
