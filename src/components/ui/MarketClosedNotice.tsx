import React from "react";
import styles from "./MarketClosedNotice.module.css";
import { MarketClosedNoticeProps } from "@/types";

const MarketClosedNotice: React.FC<MarketClosedNoticeProps> = ({
  statusIcon,
  title,
  statusText,
  description,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>{statusIcon}</div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.status}>
        현재 상태: <strong>{statusText}</strong>
      </p>
      <p className={styles.description}>{description}</p>
    </div>
  );
};

export default MarketClosedNotice;
