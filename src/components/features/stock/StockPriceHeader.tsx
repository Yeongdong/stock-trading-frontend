import React, { memo } from "react";
import { StockPriceHeaderProps } from "@/types";

const StockPriceHeader: React.FC<StockPriceHeaderProps> = memo(
  ({ symbol, name, isUnsubscribing, onUnsubscribe }) => {
    return (
      <div className="card-header">
        <div className="stock-symbol">{symbol}</div>
        {name && name !== symbol && <div className="stock-name">{name}</div>}
        <button
          className="unsubscribe-btn"
          onClick={onUnsubscribe}
          title="구독 취소"
          disabled={isUnsubscribing}
          aria-label="구독 취소"
        >
          {isUnsubscribing ? "..." : "×"}
        </button>
      </div>
    );
  }
);

StockPriceHeader.displayName = "StockPriceHeader";

export default StockPriceHeader;
