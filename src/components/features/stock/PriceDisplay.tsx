import React, { memo, useMemo } from "react";
import { PriceDisplayProps } from "@/types";

const PriceDisplay: React.FC<PriceDisplayProps> = memo(
  ({ price, priceChange, changeRate, className = "" }) => {
    // 가격 변화에 따른 스타일 클래스
    const priceChangeClass = useMemo(
      () =>
        priceChange > 0
          ? "price-up"
          : priceChange < 0
          ? "price-down"
          : "price-unchanged",
      [priceChange]
    );

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
      <div className={`price-container ${className}`}>
        <div className={`current-price ${priceChangeClass}`}>
          {formattedPrice} 원
        </div>

        <div className={`price-change ${priceChangeClass}`}>
          {formattedChange} 원 ({formattedRate}%)
        </div>
      </div>
    );
  }
);

PriceDisplay.displayName = "PriceDisplay";

export default PriceDisplay;
