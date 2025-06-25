import React from "react";
import { OverseasAccountBalance } from "@/types/domains/stock/overseas-balance";
import styles from "./OverseasSummaryCard.module.css";
import { formatNumber } from "@/utils";
import { formatCurrency } from "@/utils/formatters";

interface OverseasSummaryCardProps {
  balance: OverseasAccountBalance;
}

const OverseasSummaryCard: React.FC<OverseasSummaryCardProps> = ({
  balance,
}) => {
  // 통화별로 그룹핑하여 계산
  const currencyGroups = balance.positions.reduce((groups, position) => {
    const currency = position.currencyCode || "USD";
    if (!groups[currency]) {
      groups[currency] = [];
    }
    groups[currency].push(position);
    return groups;
  }, {} as Record<string, typeof balance.positions>);

  // 주요 통화별 요약 정보 계산
  const currencySummaries = Object.entries(currencyGroups).map(
    ([currency, positions]) => {
      const totalPurchase = positions.reduce(
        (sum, pos) => sum + parseFloat(pos.purchaseAmount || "0"),
        0
      );
      const totalEvaluation = positions.reduce(
        (sum, pos) => sum + parseFloat(pos.evaluationAmount || "0"),
        0
      );
      const totalProfitLoss = totalEvaluation - totalPurchase;
      const totalProfitLossRate =
        totalPurchase > 0 ? (totalProfitLoss / totalPurchase) * 100 : 0;

      return {
        currency,
        totalPurchase,
        totalEvaluation,
        totalProfitLoss,
        totalProfitLossRate,
        positionCount: positions.length,
      };
    }
  );

  // 손익 상태 결정
  const getProfitLossClass = (value: number): string => {
    if (value > 0) return styles.positive;
    if (value < 0) return styles.negative;
    return styles.neutral;
  };

  return (
    <div className={styles.summaryCard}>
      <h3 className={styles.cardTitle}>해외 주식 보유 현황</h3>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <span className={styles.label}>보유 종목 수</span>
          <span className={styles.value}>
            {formatNumber(balance.totalPositions)}개
          </span>
        </div>

        <div className={styles.summaryItem}>
          <span className={styles.label}>보유 통화</span>
          <span className={styles.value}>
            {Object.keys(currencyGroups).join(", ")}
          </span>
        </div>

        {currencySummaries.map((summary) => (
          <React.Fragment key={summary.currency}>
            <div className={styles.summaryItem}>
              <span className={styles.label}>
                매입금액 ({summary.currency})
              </span>
              <span className={styles.value}>
                {formatCurrency(summary.totalPurchase, summary.currency)}
              </span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.label}>
                평가금액 ({summary.currency})
              </span>
              <span className={styles.value}>
                {formatCurrency(summary.totalEvaluation, summary.currency)}
              </span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.label}>
                평가손익 ({summary.currency})
              </span>
              <span
                className={`${styles.value} ${getProfitLossClass(
                  summary.totalProfitLoss
                )}`}
              >
                {formatCurrency(summary.totalProfitLoss, summary.currency)}
              </span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.label}>수익률 ({summary.currency})</span>
              <span
                className={`${styles.value} ${getProfitLossClass(
                  summary.totalProfitLossRate
                )}`}
              >
                {summary.totalProfitLossRate >= 0 ? "+" : ""}
                {summary.totalProfitLossRate.toFixed(2)}%
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default OverseasSummaryCard;
