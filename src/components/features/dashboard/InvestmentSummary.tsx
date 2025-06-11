import React, { memo, useState, useEffect } from "react";
import { formatKRW } from "@/utils/formatters";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import styles from "./InvestmentSummary.module.css";
import { Position, Summary } from "@/types/stock/balance";
import Link from "next/link";

interface SummaryCardData {
  icon: string;
  title: string;
  value: string;
  subValue?: string;
  changeClass?: string;
}

interface InvestmentSummaryProps {
  summary?: Summary;
  positions?: Position[];
  isLoading: boolean;
}

const InvestmentSummary: React.FC<InvestmentSummaryProps> = memo(
  ({ summary, positions = [], isLoading }) => {
    const [summaryCards, setSummaryCards] = useState<SummaryCardData[]>([]);

    useEffect(() => {
      if (!summary) return;

      // 총평가금액
      const totalValue = parseInt(summary.tot_evlu_amt);
      const totalDeposit = parseInt(summary.dnca_tot_amt);
      const stockValue = parseInt(summary.scts_evlu_amt);

      // 전일대비 계산 (임시로 2.1% 고정값 - 실제론 API에서 받아와야 함)
      const dailyChangeRate = 2.1;
      const dailyChangeAmount = Math.floor(
        totalValue * (dailyChangeRate / 100)
      );

      // 총손익 계산
      const purchaseAmount = parseInt(summary.pchs_amt_smtl_amt);
      const totalProfitLoss = stockValue - purchaseAmount;
      const totalProfitRate =
        purchaseAmount > 0 ? (totalProfitLoss / purchaseAmount) * 100 : 0;

      // 당일손익 (임시 계산)
      const dailyProfitLoss = dailyChangeAmount;
      const dailyProfitRate = dailyChangeRate;

      const cards: SummaryCardData[] = [
        {
          icon: "💰",
          title: "총평가금액",
          value: formatKRW(summary.tot_evlu_amt),
          subValue: `전일대비 ${
            dailyChangeRate > 0 ? "+" : ""
          }${dailyChangeRate.toFixed(1)}%`,
          changeClass:
            dailyChangeRate > 0
              ? "positive"
              : dailyChangeRate < 0
              ? "negative"
              : "neutral",
        },
        {
          icon: "📈",
          title: "총손익률",
          value: `${totalProfitRate > 0 ? "+" : ""}${totalProfitRate.toFixed(
            1
          )}%`,
          subValue: `(${totalProfitLoss > 0 ? "+" : ""}${formatKRW(
            totalProfitLoss.toString()
          )})`,
          changeClass:
            totalProfitRate > 0
              ? "positive"
              : totalProfitRate < 0
              ? "negative"
              : "neutral",
        },
        {
          icon: "📊",
          title: "당일손익",
          value: `${dailyProfitLoss > 0 ? "+" : ""}${formatKRW(
            dailyProfitLoss.toString()
          )}`,
          subValue: `(${
            dailyProfitRate > 0 ? "+" : ""
          }${dailyProfitRate.toFixed(1)}%)`,
          changeClass:
            dailyProfitRate > 0
              ? "positive"
              : dailyProfitRate < 0
              ? "negative"
              : "neutral",
        },
        {
          icon: "📋",
          title: "보유종목",
          value: `${positions.length}종목`,
          subValue:
            positions.length > 0
              ? `평균 수익률 ${totalProfitRate.toFixed(1)}%`
              : "보유종목 없음",
          changeClass: "neutral",
        },
      ];

      setSummaryCards(cards);
    }, [summary, positions]);

    if (isLoading) {
      return (
        <section className={styles.investmentSummary}>
          <h2 className={styles.sectionTitle}>📊 내 투자 현황 요약</h2>
          <LoadingIndicator message="투자 현황을 불러오는 중..." size="small" />
        </section>
      );
    }

    if (!summary) {
      return (
        <section className={styles.investmentSummary}>
          <h2 className={styles.sectionTitle}>📊 내 투자 현황 요약</h2>
          <div className={styles.errorMessage}>
            투자 현황을 불러올 수 없습니다.
          </div>
        </section>
      );
    }

    return (
      <section className={styles.investmentSummary}>
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>📊 내 투자 현황 요약</h2>
          <Link href="/balance" className={styles.balanceButton}>
            잔고 확인 →
          </Link>
        </div>
        <div className={styles.cardsContainer}>
          {summaryCards.map((card, index) => (
            <div key={index} className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>{card.icon}</span>
                <span className={styles.cardTitle}>{card.title}</span>
              </div>

              <div className={styles.cardBody}>
                <div
                  className={`${styles.cardValue} ${
                    styles[card.changeClass || "neutral"]
                  }`}
                >
                  {card.value}
                </div>
                {card.subValue && (
                  <div
                    className={`${styles.cardSubValue} ${
                      styles[card.changeClass || "neutral"]
                    }`}
                  >
                    {card.subValue}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
);

InvestmentSummary.displayName = "InvestmentSummary";

export default InvestmentSummary;
