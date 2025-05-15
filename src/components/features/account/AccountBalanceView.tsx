import React from "react";
import { AccountBalanceViewProps } from "@/types/components/account";
import { SummaryCard } from "@/components/features/account/SummaryCard";
import { PositionsTable } from "@/components/features/account/PositionTable";
import { ERROR_MESSAGES } from "@/constants/errors";

const AccountBalanceView: React.FC<AccountBalanceViewProps> = ({
  balanceData,
  isLoading,
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{ERROR_MESSAGES.BALANCE.DATA_LOADING}</p>
      </div>
    );
  }

  if (!balanceData) {
    return (
      <div className="error-state">
        <h1>잔고 데이터를 불러올 수 없습니다</h1>
        <button onClick={onRefresh} className="retry-button">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="balance-content">
      <SummaryCard summary={balanceData.summary} />

      {balanceData.positions.length > 0 ? (
        <PositionsTable positions={balanceData.positions} />
      ) : (
        <div className="empty-positions">
          <p>{ERROR_MESSAGES.BALANCE.EMPTY_POSITIONS}</p>
        </div>
      )}
    </div>
  );
};

export default AccountBalanceView;
