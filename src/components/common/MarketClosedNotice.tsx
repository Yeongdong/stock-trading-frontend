import React from "react";
import styles from "./MarketClosedNotice.module.css";

interface MarketClosedNoticeProps {
  statusText: string;
  statusIcon: string;
  nextOpenTime?: string;
}

const MarketClosedNotice: React.FC<MarketClosedNoticeProps> = ({
  statusText,
  statusIcon,
  nextOpenTime,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>{statusIcon}</div>
      <h2 className={styles.title}>실시간 서비스 일시 중단</h2>
      <p className={styles.status}>
        현재 상태: <strong>{statusText}</strong>
      </p>
      <p className={styles.description}>
        한국거래소는 평일 오전 9시부터 오후 3시 30분까지 운영됩니다.
        <br />장 시간 외에는 실시간 데이터를 제공하지 않습니다.
      </p>
      {nextOpenTime && (
        <div className={styles.nextOpen}>
          <span className={styles.nextOpenLabel}>다음 장 시작:</span>
          <span className={styles.nextOpenTime}>{nextOpenTime}</span>
        </div>
      )}
    </div>
  );
};

export default MarketClosedNotice;
