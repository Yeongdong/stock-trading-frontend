import React, { memo, useMemo } from "react";
import { formatKRW, formatPercent } from "@/utils";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import styles from "./InvestmentSummary.module.css";
import { Position, Summary } from "@/types/domains/stock/balance";
import Link from "next/link";
import { InvestmentSummaryProps, SummaryCardData } from "@/types";

const useInvestmentCalculations = (
  summary?: Summary,
  positions: Position[] = []
) => {
  return useMemo(() => {
    if (!summary) return null;

    const totalValue = parseInt(summary.tot_evlu_amt);
    const stockValue = parseInt(summary.scts_evlu_amt);
    const purchaseAmount = parseInt(summary.pchs_amt_smtl_amt);

    // 총손익 계산
    const totalProfitLoss = stockValue - purchaseAmount;
    const totalProfitRate =
      purchaseAmount > 0 ? (totalProfitLoss / purchaseAmount) * 100 : 0;

    // 당일손익 데이터
    const dailyChangeRate = summary.dailyProfitLossRate || 0;
    const dailyChangeAmount = summary.dailyProfitLossAmount || 0;

    return {
      totalValue,
      stockValue,
      purchaseAmount,
      totalProfitLoss,
      totalProfitRate,
      dailyChangeRate,
      dailyChangeAmount,
      positionCount: positions.length,
    };
  }, [summary, positions.length]);
};

const createSummaryCards = (
  calculations: ReturnType<typeof useInvestmentCalculations>,
  summary: Summary
): SummaryCardData[] => {
  if (!calculations) return [];

  const {
    totalProfitLoss,
    totalProfitRate,
    dailyChangeRate,
    dailyChangeAmount,
    positionCount,
  } = calculations;

  const getChangeClass = (value: number) => {
    if (value > 0) return "positive";
    if (value < 0) return "negative";
    return "neutral";
  };

  return [
    {
      icon: "💰",
      title: "총평가금액",
      value: formatKRW(summary.tot_evlu_amt),
      subValue: `전일대비 ${formatPercent(dailyChangeRate)}`,
      changeClass: getChangeClass(dailyChangeRate),
    },
    {
      icon: "📈",
      title: "총손익률",
      value: formatPercent(totalProfitRate),
      subValue: `(${formatPercent(totalProfitLoss, 0)})`,
      changeClass: getChangeClass(totalProfitRate),
    },
    {
      icon: "📊",
      title: "당일손익",
      value: formatKRW(dailyChangeAmount),
      subValue: `(${formatPercent(dailyChangeRate)})`,
      changeClass: getChangeClass(dailyChangeRate),
    },
    {
      icon: "📋",
      title: "보유종목",
      value: `${positionCount}종목`,
      subValue:
        positionCount > 0
          ? `평균 수익률 ${totalProfitRate.toFixed(1)}%`
          : "보유종목 없음",
      changeClass: "neutral",
    },
  ];
};

const InvestmentSummary: React.FC<InvestmentSummaryProps> = memo(
  ({ summary, positions = [], isLoading }) => {
    const calculations = useInvestmentCalculations(summary, positions);
    const summaryCards = useMemo(
      () => (summary ? createSummaryCards(calculations, summary) : []),
      [calculations, summary]
    );

    if (isLoading) {
      return (
        <section className={styles.investmentSummary}>
          <h2 className={styles.sectionTitle}>📊 내 투자 현황 요약</h2>
          <LoadingIndicator message="투자 현황을 불러오는 중..." />
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
