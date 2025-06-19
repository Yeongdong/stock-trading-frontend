import React, { memo } from "react";
import { PriceDisplayProps } from "@/types";
import styles from "./StockPriceDisplay.module.css";

const PriceDisplay: React.FC<PriceDisplayProps> = memo(
  ({ price, priceChange, changeRate, className = "" }) => {
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
