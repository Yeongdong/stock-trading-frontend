import React from "react";

interface StockPriceHeaderProps {
  symbol: string;
  name?: string;
  isUnsubscribing: boolean;
  onUnsubscribe: () => void;
}

const StockPriceHeader: React.FC<StockPriceHeaderProps> = ({
  symbol,
  name,
  isUnsubscribing,
  onUnsubscribe,
}) => {
  return (
    <div className="card-header">
      <div className="stock-symbol">{symbol}</div>
      {name && <div className="stock-name">{name}</div>}
      <button
        className="unsubscribe-btn"
        onClick={onUnsubscribe}
        title="구독 취소"
        disabled={isUnsubscribing}
      >
        {isUnsubscribing ? "..." : "×"}
      </button>
    </div>
  );
};

export default StockPriceHeader;
