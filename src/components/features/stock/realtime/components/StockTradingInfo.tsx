import React, { memo } from "react";
import { TradingInfoProps } from "@/types";
import styles from "./StockTradingInfo.module.css";

const TradingInfo: React.FC<TradingInfoProps> = memo(({ volume, time }) => {
  return (
    <footer className={styles.tradingInfo}>
      <div className={styles.infoItem}>
        <span className={styles.label}>거래량</span>
        <span className={styles.value}>{volume.toLocaleString()}</span>
      </div>

      <div className={styles.infoItem}>
        <span className={styles.label}>업데이트</span>
        <span className={styles.value}>{time}</span>
      </div>
    </footer>
  );
});

TradingInfo.displayName = "TradingInfo";

export default TradingInfo;
