import React, { memo } from "react";
import SymbolSubscriptionManager from "../stock/SymbolSubscriptionManager";
import LoadingIndicator from "../../ui/LoadingIndicator";
import EmptySubscriptionState from "./EmptySubscriptionState";
import DashboardHeader from "./DashboardHeader";
import styles from "./RealtimeDashboard.module.css";
import StockGrid from "../stock/realtime/StockGrid";
import { useRealtimeDashboardState } from "@/hooks/realtime/useRealtimeDashboardState";
import { RealtimeDashboardProps } from "@/types";

const RealtimeDashboard: React.FC<RealtimeDashboardProps> = memo(
  ({ title = "실시간 주가 모니터링" }) => {
    const { showLoading, showEmptyState, hasSubscriptions, subscribedSymbols } =
      useRealtimeDashboardState();

    return (
      <div className={styles.realtimeDashboard}>
        <DashboardHeader title={title} />

        <section className={styles.subscriptionSection}>
          <SymbolSubscriptionManager />
        </section>

        <main className={styles.contentArea}>
          {showLoading && (
            <LoadingIndicator message="실시간 데이터를 불러오는 중..." />
          )}

          {showEmptyState && <EmptySubscriptionState />}

          {hasSubscriptions && <StockGrid symbols={subscribedSymbols} />}
        </main>
      </div>
    );
  }
);

RealtimeDashboard.displayName = "RealtimeDashboard";

export default RealtimeDashboard;
