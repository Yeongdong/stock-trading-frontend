import React from "react";
import { OverseasDepositInfo } from "@/types/domains/stock/overseas-balance";
import styles from "./OverseasDepositSummary.module.css";

interface OverseasDepositSummaryProps {
  depositInfo?: OverseasDepositInfo;
  isLoading: boolean;
}

const OverseasDepositSummary: React.FC<OverseasDepositSummaryProps> = ({
  depositInfo,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className={styles.summaryContainer}>
        <div className={styles.summaryCard}>
          <div className={styles.cardTitle}>예수금</div>
          <div className={styles.cardValue}>로딩 중...</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardTitle}>주문가능금액</div>
          <div className={styles.cardValue}>로딩 중...</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardTitle}>총 평가금액</div>
          <div className={styles.cardValue}>로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!depositInfo) {
    return (
      <div className={styles.summaryContainer}>
        <div className={styles.summaryCard}>
          <div className={styles.cardTitle}>예수금</div>
          <div className={styles.cardValue}>₩0.00</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardTitle}>주문가능금액</div>
          <div className={styles.cardValue}>₩0.00</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.cardTitle}>총 평가금액</div>
          <div className={styles.cardValue}>₩0.00</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.summaryCard}>
        <div className={styles.cardTitle}>예수금</div>
        <div className={styles.cardValue}>
          ₩{depositInfo.totalDepositAmountKrw.toLocaleString()}
        </div>
      </div>
      <div className={styles.summaryCard}>
        <div className={styles.cardTitle}>주문가능금액</div>
        <div className={styles.cardValue}>
          {depositInfo.orderableAmount.toLocaleString()}{" "}
          {depositInfo.currencyCode}
        </div>
      </div>
      <div className={styles.summaryCard}>
        <div className={styles.cardTitle}>총 평가금액</div>
        <div className={styles.cardValue}>
          ₩{depositInfo.totalDepositAmountKrw.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default OverseasDepositSummary;
