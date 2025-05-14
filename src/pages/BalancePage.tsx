"use client";

import { useState, useEffect } from "react";
import { StockBalance } from "@/types/stock/balance";
import { useError } from "@/contexts/ErrorContext";
import { apiClient } from "@/services/api/common/apiClient";
import { ERROR_MESSAGES } from "@/constants/errors";
import { API } from "@/constants/api";
import AccountBalanceView from "@/components/features/account/AccountBalanceView";

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

      <AccountBalanceView
        balanceData={balanceData}
        isLoading={isLoading}
        onRefresh={fetchBalanceData}
      />
    </div>
  );
}
