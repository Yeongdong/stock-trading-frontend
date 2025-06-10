import React, { memo } from "react";
import { StockPriceHeaderProps } from "@/types";
import styles from "./StockPriceCard.module.css";

const StockPriceHeader: React.FC<StockPriceHeaderProps> = memo(
  ({ symbol, name, isUnsubscribing, onUnsubscribe }) => {
    return (
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.stockSymbol}>{symbol}</div>
          {name && name !== symbol && (
            <div className={styles.stockName}>{name}</div>
          )}
        </div>
        <button
          className={styles.unsubscribeBtn}
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
