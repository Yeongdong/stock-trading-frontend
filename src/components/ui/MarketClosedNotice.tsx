import React from "react";
import styles from "./MarketClosedNotice.module.css";
import { MarketClosedNoticeProps } from "@/types";

const MarketClosedNotice: React.FC<MarketClosedNoticeProps> = ({
  statusIcon,
  title,
  statusText,
  description,
  nextOpenTime,
  nextOpenLabel = "다음 장 시작:",
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>{statusIcon}</div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.status}>
        현재 상태: <strong>{statusText}</strong>
      </p>
      <p className={styles.description}>{description}</p>
      {nextOpenTime && (
        <div className={styles.nextOpen}>
          <span className={styles.nextOpenLabel}>{nextOpenLabel}</span>
          <span className={styles.nextOpenTime}>{nextOpenTime}</span>
        </div>
      )}
    </div>
  );
};

export default MarketClosedNotice;
