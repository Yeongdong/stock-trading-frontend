import React from "react";
import { SummaryCard } from "@/components/features/account/SummaryCard";
import { PositionsTable } from "@/components/features/account/PositionsTable";
import { ERROR_MESSAGES } from "@/constants/errors";
import styles from "./AccountBalanceView.module.css";
import { AccountBalanceViewProps } from "@/types";

const AccountBalanceView: React.FC<AccountBalanceViewProps> = ({
  balanceData,
  isLoading,
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>{ERROR_MESSAGES.BALANCE.DATA_LOADING}</p>
      </div>
    );
  }

  if (!balanceData) {
    return (
      <div className={styles.errorState}>
        <h1>잔고 데이터를 불러올 수 없습니다</h1>
        <button onClick={onRefresh} className={styles.retryButton}>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className={styles.balanceContent}>
      <SummaryCard summary={balanceData.summary} />

      {balanceData.positions.length > 0 ? (
        <PositionsTable positions={balanceData.positions} />
      ) : (
        <div className={styles.emptyPositions}>
          <p>{ERROR_MESSAGES.BALANCE.EMPTY_POSITIONS}</p>
        </div>
      )}
    </div>
  );
};

export default AccountBalanceView;
