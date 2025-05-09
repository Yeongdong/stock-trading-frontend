"use client";

import { useState, useEffect } from "react";
import { StockBalance } from "@/types";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { PositionsTable } from "@/components/ui/PositionsTable";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/apiClient";
import { API, ERROR_MESSAGES } from "@/constants";

export default function BalancePage() {
  const [balanceData, setBalanceData] = useState<StockBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addError } = useError();

  const fetchBalanceData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<StockBalance>(API.STOCK.BALANCE);

      if (response.error) {
        throw new Error(response.error);
      }
      setBalanceData(response.data!);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : ERROR_MESSAGES.BALANCE.FETCH_FAILED;
      addError({
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceData();
  });

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
        <button onClick={fetchBalanceData} className="retry-button">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="balance-page">
      <div className="page-header">
        <h1>주식 잔고 현황</h1>
        <button
          onClick={fetchBalanceData}
          className="refresh-button"
          disabled={isLoading}
        >
          {isLoading ? "불러오는 중..." : "새로고침"}
        </button>
      </div>

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
}
