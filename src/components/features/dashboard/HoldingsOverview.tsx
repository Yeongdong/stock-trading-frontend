import React, { memo, useMemo } from "react";
import { formatKRW } from "@/utils/formatters";
import Link from "next/link";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import styles from "./HoldingsOverview.module.css";
import { useRouter } from "next/navigation";
import { HoldingItem, HoldingsOverviewProps } from "@/types";

const HoldingsOverview: React.FC<HoldingsOverviewProps> = memo(
  ({ positions = [], isLoading }) => {
    const router = useRouter();

    const topHoldings = useMemo(() => {
      if (!positions) return [];

      const holdings: HoldingItem[] = positions
        .map((position) => ({
          ...position,
          profitLossRate: parseFloat(position.evlu_pfls_rt),
          profitLossAmount: parseInt(position.evlu_pfls_amt),
        }))
        .filter((holding) => parseInt(holding.hldg_qty) > 0)
        .sort((a, b) => b.profitLossRate - a.profitLossRate)
        .slice(0, 5);

      return holdings;
    }, [positions]);

    const getChangeClass = (value: number): string => {
      if (value > 0) return "positive";
      if (value < 0) return "negative";
      return "neutral";
    };

    const formatNumber = (value: string | number): string => {
      const num = typeof value === "string" ? parseInt(value) : value;
      return num.toLocaleString();
    };

    const handleStockAction = (action: string, holding: HoldingItem) => {
      if (action === "매수") {
        const orderParams = new URLSearchParams({
          stockCode: holding.pdno,
          stockName: encodeURIComponent(holding.prdt_name),
          currentPrice: holding.prpr,
          orderType: "buy",
        });
        router.push(`/order?${orderParams.toString()}`);
      } else if (action === "매도") {
        const orderParams = new URLSearchParams({
          stockCode: holding.pdno,
          stockName: encodeURIComponent(holding.prdt_name),
          currentPrice: holding.prpr,
          holdingQty: holding.hldg_qty,
          orderType: "sell",
        });
        router.push(`/order?${orderParams.toString()}`);
      } else if (action === "차트보기") {
        router.push(`/realtime?symbol=${holding.pdno}&autoSubscribe=true`);
      }
    };

    if (isLoading) {
      return (
        <section className={styles.holdingsOverview}>
          <h2 className={styles.sectionTitle}>📋 내 보유종목 현황 (TOP 5)</h2>
          <LoadingIndicator message="보유종목을 불러오는 중..." size="small" />
        </section>
      );
    }

    if (!positions || topHoldings.length === 0) {
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
    }

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
                          {holding.profitLossRate > 0 ? "+" : ""}
                          {holding.profitLossRate.toFixed(1)}%
                        </div>
                        <div className={styles.profitAmount}>
                          ({holding.profitLossAmount > 0 ? "+" : ""}
                          {formatKRW(holding.profitLossAmount.toString())})
                        </div>
                      </div>
                    </td>
                    <td className={styles.actionCell}>
                      <div className={styles.actionButtons}>
                        <button
                          className={`${styles.actionButton} ${styles.buyButton}`}
                          onClick={() => handleStockAction("매수", holding)}
                          title="매수 주문"
                        >
                          매수
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.sellButton}`}
                          onClick={() => handleStockAction("매도", holding)}
                          title="매도 주문"
                        >
                          매도
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.chartButton}`}
                          onClick={() => handleStockAction("차트보기", holding)}
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
