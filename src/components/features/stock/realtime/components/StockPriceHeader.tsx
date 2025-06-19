import React, { memo } from "react";
import { StockPriceHeaderProps } from "@/types";
import styles from "./StockPriceHeader.module.css";

const StockPriceHeader: React.FC<StockPriceHeaderProps> = memo(
  ({ symbol, name, isUnsubscribing, onUnsubscribe }) => {
    return (
      <header className={styles.cardHeader}>
        <div className={styles.stockInfo}>
          <h3 className={styles.stockSymbol}>{symbol}</h3>
          {name && <p className={styles.stockName}>{name}</p>}
        </div>

        <button
          className={styles.unsubscribeBtn}
          onClick={onUnsubscribe}
          disabled={isUnsubscribing}
          aria-label={`${symbol} 구독 취소`}
          title="구독 취소"
        >
          {isUnsubscribing ? (
            <span className={styles.loadingDots} aria-hidden="true">
              ⋯
            </span>
          ) : (
            <span aria-hidden="true">×</span>
          )}
        </button>
      </header>
    );
  }
);

StockPriceHeader.displayName = "StockPriceHeader";

export default StockPriceHeader;
