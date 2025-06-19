import React, { memo } from "react";
import { formatKRW, formatNumber, formatPercent } from "@/utils";
import Link from "next/link";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import styles from "./HoldingsOverview.module.css";
import { useRouter } from "next/navigation";
import { HoldingsOverviewProps } from "@/types";
import { useHoldingsCalculations } from "@/hooks/holdings/useHoldingsCalculations";

const HoldingsOverview: React.FC<HoldingsOverviewProps> = memo(
  ({ positions = [], isLoading }) => {
    const router = useRouter();

    const topHoldings = useHoldingsCalculations(positions);

    const getChangeClass = (value: number): string => {
      if (value > 0) return "positive";
      if (value < 0) return "negative";
      return "neutral";
    };

    const handleStockAction = (
      action: string,
      stockCode: string,
      stockName: string,
      currentPrice: string,
      holdingQty?: string
    ) => {
      const baseParams = {
        stockCode,
        stockName: encodeURIComponent(stockName),
        currentPrice,
      };

      switch (action) {
        case "매수":
          const buyParams = new URLSearchParams({
            ...baseParams,
            orderType: "buy",
          });
          router.push(`/order?${buyParams.toString()}`);
          break;

        case "매도":
          const sellParams = new URLSearchParams({
            ...baseParams,
            holdingQty: holdingQty || "0",
            orderType: "sell",
          });
          router.push(`/order?${sellParams.toString()}`);
          break;

        case "차트보기":
          router.push(`/realtime?symbol=${stockCode}&autoSubscribe=true`);
          break;
      }
    };

    if (isLoading) {
      return (
        <section className={styles.holdingsOverview}>
          <h2 className={styles.sectionTitle}>📋 내 보유종목 현황 (TOP 5)</h2>
          <LoadingIndicator message="보유종목을 불러오는 중..." />
        </section>
      );
    }

    if (!positions || topHoldings.length === 0)
      return (
        <section className={styles.holdingsOverview}>
          <h2 className={styles.sectionTitle}>📋 내 보유종목 현황 (TOP 5)</h2>
          <div className={styles.emptyState}>
            <p>보유 중인 종목이 없습니다.</p>
            <Link href="/stock-search" className={styles.searchButton}>
              종목 검색하기 →
            </Link>
          </div>
        </section>
      );

    return (
      <section className={styles.holdingsOverview}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>📋 내 보유종목 현황 (TOP 5)</h2>
          <Link href="/balance" className={styles.viewAllButton}>
            전체보기 →
          </Link>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.holdingsTable}>
              <thead>
                <tr>
                  <th>종목명</th>
                  <th>보유수량</th>
                  <th>현재가</th>
                  <th>평가금액</th>
                  <th>손익률</th>
                  <th>액션</th>
                </tr>
              </thead>
              <tbody>
                {topHoldings.map((holding) => (
                  <tr key={holding.pdno} className={styles.holdingRow}>
                    <td className={styles.stockNameCell}>
                      <div className={styles.stockName}>
                        {holding.prdt_name}
                      </div>
                      <div className={styles.stockCode}>({holding.pdno})</div>
                    </td>
                    <td className={styles.numberCell}>
                      {formatNumber(holding.hldg_qty)}주
                    </td>
                    <td className={styles.numberCell}>
                      {formatKRW(holding.prpr)}
                    </td>
                    <td className={styles.numberCell}>
                      {formatKRW(holding.evlu_amt)}
                    </td>
                    <td className={styles.numberCell}>
                      <div
                        className={`${styles.profitLoss} ${
                          styles[getChangeClass(holding.profitLossRate)]
                        }`}
                      >
                        <div className={styles.profitRate}>
                          {formatPercent(holding.profitLossRate)}
                        </div>
                        <div className={styles.profitAmount}>
                          ({formatKRW(holding.profitLossAmount)})
                        </div>
                      </div>
                    </td>
                    <td className={styles.actionCell}>
                      <div className={styles.actionButtons}>
                        <button
                          className={`${styles.actionButton} ${styles.buyButton}`}
                          onClick={() =>
                            handleStockAction(
                              "매수",
                              holding.pdno,
                              holding.prdt_name,
                              holding.prpr
                            )
                          }
                          title="매수 주문"
                        >
                          매수
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.sellButton}`}
                          onClick={() =>
                            handleStockAction(
                              "매도",
                              holding.pdno,
                              holding.prdt_name,
                              holding.prpr,
                              holding.hldg_qty
                            )
                          }
                          title="매도 주문"
                        >
                          매도
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.chartButton}`}
                          onClick={() =>
                            handleStockAction(
                              "차트보기",
                              holding.pdno,
                              holding.prdt_name,
                              holding.prpr
                            )
                          }
                          title="실시간 차트 보기"
                        >
                          차트
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }
);

HoldingsOverview.displayName = "HoldingsOverview";

export default HoldingsOverview;
