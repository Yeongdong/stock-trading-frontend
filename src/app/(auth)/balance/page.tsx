"use client";

import { useBalance } from "@/hooks/balance/useBalance";
import AccountBalanceView from "@/components/features/account/AccountBalanceView";
import OrderExecutionView from "@/components/features/orderExecution/OrderExecutionView";
import styles from "./page.module.css";

export default function BalancePage() {
  const { balanceData, isLoading, refresh } = useBalance();

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>주식 잔고 현황</h1>
        <button
          onClick={refresh}
          className={styles.refreshButton}
          disabled={isLoading}
        >
          {isLoading ? "불러오는 중..." : "새로고침"}
        </button>
      </div>
      <div className={styles.content}>
        <AccountBalanceView
          balanceData={balanceData}
          isLoading={isLoading}
          onRefresh={refresh}
        />
      </div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>주문체결내역 조회</h1>
      </div>
      <div className={styles.content}>
        <OrderExecutionView />
      </div>
    </div>
  );
}
