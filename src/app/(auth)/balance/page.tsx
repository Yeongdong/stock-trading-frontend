"use client";

import { useBalance } from "@/hooks/balance/useBalance";
import AccountBalanceView from "@/components/features/account/AccountBalanceView";
import OrderExecutionView from "@/components/features/orderExecution/OrderExecutionView";

export default function BalancePage() {
  const { balanceData, isLoading, refetch } = useBalance();

  return (
    <div className="balance-page">
      <div className="page-header">
        <h1>주식 잔고 현황</h1>
        <button
          onClick={refetch}
          className="refresh-button"
          disabled={isLoading}
        >
          {isLoading ? "불러오는 중..." : "새로고침"}
        </button>
      </div>

      <AccountBalanceView
        balanceData={balanceData}
        isLoading={isLoading}
        onRefresh={refetch}
      />
      <OrderExecutionView />
    </div>
  );
}
