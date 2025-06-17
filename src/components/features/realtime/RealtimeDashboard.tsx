import React, { memo } from "react";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import SymbolSubscriptionManager from "../stock/SymbolSubscriptionManager";
import LoadingIndicator from "../../ui/LoadingIndicator";
import EmptySubscriptionState from "./EmptySubscriptionState";
import StockGrid from "../stock/StockGrid";
import DashboardHeader from "./DashboardHeader";
import styles from "./RealtimeDashboard.module.css";

const RealtimeDashboard: React.FC = memo(() => {
  const { subscribedSymbols, isLoading } = useStockOperations();

  const hasSubscriptions = subscribedSymbols.length > 0;
  const showEmptyState = !hasSubscriptions && !isLoading;

  return (
    <div className={styles.realtimeDashboard}>
      <DashboardHeader title="실시간 주가 모니터링" />

      <div className={styles.subscriptionSection}>
        <SymbolSubscriptionManager />
      </div>

      <div className={styles.contentArea}>
        {isLoading && <LoadingIndicator />}

        {showEmptyState && <EmptySubscriptionState />}

        {hasSubscriptions && <StockGrid symbols={subscribedSymbols} />}
      </div>
    </div>
  );
});

RealtimeDashboard.displayName = "RealtimeDashboard";

export default RealtimeDashboard;
