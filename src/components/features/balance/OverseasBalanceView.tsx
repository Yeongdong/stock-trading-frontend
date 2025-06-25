import React from "react";
import { OverseasAccountBalance } from "@/types/domains/stock/overseas-balance";
import styles from "./OverseasBalanceView.module.css";
import OverseasSummaryCard from "./OverseasSummaryCard";
import OverseasPositionsTable from "./OverseasPositionsTable";

interface OverseasBalanceViewProps {
  balance: OverseasAccountBalance | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const OverseasBalanceView: React.FC<OverseasBalanceViewProps> = ({
  balance,
  isLoading,
  error,
  onRefresh,
}) => {
  if (isLoading)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>해외 잔고 정보를 불러오는 중...</p>
      </div>
    );

  if (error)
    return (
      <div className={styles.errorState}>
        <h3>해외 잔고 데이터를 불러올 수 없습니다</h3>
        <p className={styles.errorMessage}>{error}</p>
        <button
          onClick={onRefresh}
          className={styles.retryButton}
          type="button"
        >
          다시 시도
        </button>
      </div>
    );

  if (!balance) {
    return (
      <div className={styles.errorState}>
        <h3>해외 잔고 데이터가 없습니다</h3>
        <button
          onClick={onRefresh}
          className={styles.retryButton}
          type="button"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={styles.balanceContent}>
      <div className={styles.summarySection}>
        <OverseasSummaryCard balance={balance} />
      </div>

      <div className={styles.positionsSection}>
        {balance.hasPositions ? (
          <OverseasPositionsTable positions={balance.positions} />
        ) : (
          <div className={styles.emptyPositions}>
            <p>보유한 해외 주식이 없습니다</p>
            <p className={styles.emptyDescription}>
              해외 주식을 거래하면 여기에서 잔고를 확인할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverseasBalanceView;
