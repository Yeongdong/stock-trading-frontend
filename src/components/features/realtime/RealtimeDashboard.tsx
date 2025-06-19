import React, { memo, useEffect } from "react";

import LoadingIndicator from "../../ui/LoadingIndicator";
import EmptySubscriptionState from "./EmptySubscriptionState";
import DashboardHeader from "./DashboardHeader";
import StockGrid from "../stock/realtime/StockGrid";
import SymbolSubscriptionForm from "../stock/SymbolInputForm";
import styles from "./RealtimeDashboard.module.css";
import { RealtimeDashboardProps } from "@/types";
import { useRealtimeDashboard } from "@/hooks/realtime/useRealtimeDashboardState";

const RealtimeDashboard: React.FC<RealtimeDashboardProps> = memo(
  ({ title = "실시간 주가 모니터링" }) => {
    const { subscribedSymbols, isLoading, hasSubscriptions, showEmptyState } =
      useRealtimeDashboard();

    useEffect(() => {
      document.title = title;
    }, [title]);

    return (
      <div className={styles.realtimeDashboard}>
        <DashboardHeader title={title} />

        <section className={styles.subscriptionSection}>
          <SymbolSubscriptionForm />
        </section>

        <main className={styles.contentArea}>
          {isLoading && (
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
