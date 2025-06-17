import React, { memo, useMemo } from "react";
import styles from "./StockPriceCard.module.css";
import { PriceDisplayProps } from "@/types/components/stock";

const PriceDisplay: React.FC<PriceDisplayProps> = memo(
  ({ price, priceChange, changeRate, className = "" }) => {
    // 가격 변화에 따른 스타일 클래스
    const priceChangeClass = useMemo(() => {
      if (priceChange > 0) return styles.priceUp;
      if (priceChange < 0) return styles.priceDown;
      return styles.priceUnchanged;
    }, [priceChange]);

    // 숫자 포맷팅
    const formattedPrice = useMemo(
      () => Number(price).toLocaleString(),
      [price]
    );

    const formattedChange = useMemo(() => {
      const prefix = priceChange > 0 ? "+" : "";
      return `${prefix}${Number(priceChange).toLocaleString()}`;
    }, [priceChange]);

    const formattedRate = useMemo(() => changeRate.toFixed(2), [changeRate]);

    return (
      <div className={`${styles.priceContainer} ${className}`}>
        <div className={`${styles.currentPrice} ${priceChangeClass}`}>
          {formattedPrice} 원
        </div>

        <div className={`${styles.priceChange} ${priceChangeClass}`}>
          {formattedChange} 원 ({formattedRate}%)
        </div>
      </div>
    );
  }
);

PriceDisplay.displayName = "PriceDisplay";

export default PriceDisplay;
