import { useEffect } from "react";
import { useOverseasBalance } from "@/hooks/stock/useOverseasBalance";
import OverseasBalanceView from "./OverseasBalanceView";
import OverseasOrderExecutionView from "./OverseasOrderExecutionView";
import styles from "./OverseasBalance.module.css";

const OverseasBalance: React.FC = () => {
  const { balance, isLoading, error, fetchBalance } = useOverseasBalance();

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <div className={styles.container}>
      {/* 잔고 섹션 */}
      <div className={styles.balanceSection}>
        <div className={styles.header}>
          <h2 className={styles.title}>해외 주식 잔고</h2>
          <button
            onClick={fetchBalance}
            className={styles.refreshButton}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? "새로고침 중..." : "새로고침"}
          </button>
        </div>

        <div className={styles.content}>
          <OverseasBalanceView
            balance={balance}
            isLoading={isLoading}
            error={error}
            onRefresh={fetchBalance}
          />
        </div>
      </div>

      {/* 해외 주문체결내역 섹션 */}
      <div className={styles.executionSection}>
        <div className={styles.header}>
          <h2 className={styles.title}>해외 주문체결내역 조회</h2>
        </div>

        <div className={styles.content}>
          <OverseasOrderExecutionView />
        </div>
      </div>
    </div>
  );
};

export default OverseasBalance;
