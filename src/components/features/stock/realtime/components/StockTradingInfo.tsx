import React, { memo, useMemo } from "react";
import styles from "./StockPriceCard.module.css";
import { TradingInfoProps } from "@/types";

const TradingInfo: React.FC<TradingInfoProps> = memo(({ volume, time }) => {
  // 거래량 포맷팅
  const formattedVolume = useMemo(
    () => Number(volume).toLocaleString(),
    [volume]
  );

  return (
    <div className={styles.tradingInfo}>
      <div>
        <span className={styles.label}>거래량:</span>
        <span className={styles.value}>{formattedVolume}</span>
      </div>
      <div>
        <span className={styles.label}>업데이트:</span>
        <span className={styles.value}>{time}</span>
      </div>
    </div>
  );
});

TradingInfo.displayName = "TradingInfo";

export default TradingInfo;
