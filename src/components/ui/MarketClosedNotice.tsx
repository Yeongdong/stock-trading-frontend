import React from "react";
import { UI_MESSAGES } from "@/constants";
import styles from "./MarketClosedNotice.module.css";
import { MarketClosedNoticeProps } from "@/types";

const MarketClosedNotice: React.FC<MarketClosedNoticeProps> = ({
  statusText,
  statusIcon,
  nextOpenTime,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>{statusIcon}</div>
      <h2 className={styles.title}>
        {UI_MESSAGES.MARKET_STATUS.SERVICE_SUSPENDED}
      </h2>
      <p className={styles.status}>
        현재 상태: <strong>{statusText}</strong>
      </p>
      <p className={styles.description}>
        {UI_MESSAGES.MARKET_STATUS.MARKET_HOURS}
        <br />
        {UI_MESSAGES.MARKET_STATUS.NO_REALTIME_DATA}
      </p>
      {nextOpenTime && (
        <div className={styles.nextOpen}>
          <span className={styles.nextOpenLabel}>
            {UI_MESSAGES.MARKET_STATUS.NEXT_OPEN}
          </span>
          <span className={styles.nextOpenTime}>{nextOpenTime}</span>
        </div>
      )}
    </div>
  );
};

export default MarketClosedNotice;
