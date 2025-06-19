import React, { memo } from "react";
import { ChartInfoProps } from "@/types";
import styles from "./ChartInfo.module.css";

const ChartInfo: React.FC<ChartInfoProps> = memo(
  ({ startPrice, currentPrice, priceChangePercentage, priceChangeClass }) => (
    <div className={styles.chartInfo}>
      <div className={styles.chartLabel}>
        <span className={styles.labelText}>시작:</span>
        <span className={styles.chartValue}>
          {startPrice.toLocaleString()}원
        </span>
      </div>
      <div className={styles.chartLabel}>
        <span className={styles.labelText}>현재:</span>
        <span className={styles.chartValue}>
          {currentPrice.toLocaleString()}원{" "}
          <span
            className={`${styles.changeIndicator} ${styles[priceChangeClass]}`}
          >
            ({priceChangePercentage > 0 ? "+" : ""}
            {priceChangePercentage.toFixed(2)}%)
          </span>
        </span>
      </div>
    </div>
  )
);

ChartInfo.displayName = "ChartInfo";

export default ChartInfo;
