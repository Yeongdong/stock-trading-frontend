import React from "react";

interface PriceDisplayProps {
  price: number;
  priceChange: number;
  changeRate: number;
  className?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  priceChange,
  changeRate,
  className = "",
}) => {
  // 가격 변화에 따른 스타일 클래스
  const priceChangeClass =
    priceChange > 0
      ? "price-up"
      : priceChange < 0
      ? "price-down"
      : "price-unchanged";

  return (
    <div className={`price-container ${className}`}>
      <div className={`current-price ${priceChangeClass}`}>
        {Number(price).toLocaleString()} 원
      </div>

      <div className={`price-change ${priceChangeClass}`}>
        {priceChange > 0 ? "+" : ""}
        {Number(priceChange).toLocaleString()} 원 ({changeRate.toFixed(2)}%)
      </div>
    </div>
  );
};

export default PriceDisplay;
