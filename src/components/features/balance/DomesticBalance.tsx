import { useBalance } from "@/hooks/balance/useBalance";
import AccountBalanceView from "@/components/features/account/AccountBalanceView";
import OrderExecutionView from "@/components/features/orderExecution/OrderExecutionView";
import styles from "./DomesticBalance.module.css";

const DomesticBalance: React.FC = () => {
  const { balanceData, isLoading, refresh } = useBalance();

  return (
    <div className={styles.container}>
      {/* 잔고 섹션 */}
      <div className={styles.balanceSection}>
        <div className={styles.header}>
          <h2 className={styles.title}>국내 주식 잔고</h2>
          <button
            onClick={refresh}
            className={styles.refreshButton}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? "새로고침 중..." : "새로고침"}
          </button>
        </div>

        <div className={styles.content}>
          <AccountBalanceView
            balanceData={balanceData}
            isLoading={isLoading}
            onRefresh={refresh}
          />
        </div>
      </div>

      {/* 주문체결내역 섹션 */}
      <div className={styles.executionSection}>
        <div className={styles.header}>
          <h2 className={styles.title}>주문체결내역 조회</h2>
        </div>

        <div className={styles.content}>
          <OrderExecutionView />
        </div>
      </div>
    </div>
  );
};

export default DomesticBalance;
