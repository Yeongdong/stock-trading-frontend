import React, { memo, useMemo } from "react";
import { useBalance } from "@/hooks/balance/useBalance";
import { Position } from "@/types";
import { formatKRW } from "@/utils/formatters";
import Link from "next/link";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import styles from "./HoldingsOverview.module.css";

interface HoldingItem extends Position {
  profitLossRate: number;
  profitLossAmount: number;
}

const HoldingsOverview: React.FC = memo(() => {
  const { balanceData, isLoading } = useBalance();

  const topHoldings = useMemo(() => {
    if (!balanceData?.positions) return [];

    const holdings: HoldingItem[] = balanceData.positions
      .map((position) => ({
        ...position,
        profitLossRate: parseFloat(position.evlu_pfls_rt),
        profitLossAmount: parseInt(position.evlu_pfls_amt),
      }))
      .filter((holding) => parseInt(holding.hldg_qty) > 0)
      .sort((a, b) => b.profitLossRate - a.profitLossRate)
      .slice(0, 5);

    return holdings;
  }, [balanceData?.positions]);

  const getChangeClass = (value: number): string => {
    if (value > 0) return "positive";
    if (value < 0) return "negative";
    return "neutral";
  };

  const formatNumber = (value: string | number): string => {
    const num = typeof value === "string" ? parseInt(value) : value;
    return num.toLocaleString();
  };

  const handleStockAction = (
    action: string,
    stockCode: string,
    stockName: string
  ) => {
    // 실제로는 해당 페이지로 라우팅 또는 모달 열기
    console.log(`${action} 액션 - ${stockName} (${stockCode})`);

    if (action === "매도" || action === "매수") {
      window.open(`/order?stockCode=${stockCode}`, "_blank");
    } else if (action === "차트보기") {
      window.open(`/realtime?symbol=${stockCode}`, "_blank");
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

  if (!balanceData?.positions || topHoldings.length === 0) {
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
                    <div className={styles.stockName}>{holding.prdt_name}</div>
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
                        className={`${styles.actionButton} ${styles.sellButton}`}
                        onClick={() =>
                          handleStockAction(
                            "매도",
                            holding.pdno,
                            holding.prdt_name
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
                            holding.prdt_name
                          )
                        }
                        title="실시간 차트 보기"
                      >
                        차트보기
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
});

HoldingsOverview.displayName = "HoldingsOverview";

export default HoldingsOverview;
