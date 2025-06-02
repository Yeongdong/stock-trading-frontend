import React, { memo } from "react";
import { useDashboardState } from "@/hooks/realtime/useDashboardState";
import SymbolSubscriptionManager from "../stock/SymbolSubscriptionManager";
import LoadingIndicator from "../../common/LoadingIndicator";
import ErrorDisplay from "../../common/ErrorDisplay";
import EmptySubscriptionState from "./EmptySubscriptionState";
import StockGrid from "../stock/StockGrid";
import DashboardHeader from "./DashboardHeader";

const RealtimeDashboard: React.FC = memo(() => {
  const {
    error,
    showLoading,
    showEmptyState,
    hasSubscriptions,
    subscribedSymbols,
  } = useDashboardState();

  return (
    <div className="realtime-dashboard">
      <DashboardHeader title="실시간 주가 모니터링" />
      <SymbolSubscriptionManager />
      {/* 조건부 렌더링을 통한 상태 표시 */}
      {showLoading && <LoadingIndicator />}
      {error && (
        <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
      )}
      {showEmptyState && <EmptySubscriptionState />}
      {/* 구독 종목이 있는 경우 그리드 표시 */}
      {hasSubscriptions && <StockGrid symbols={subscribedSymbols} />}
    </div>
  );
});

RealtimeDashboard.displayName = "RealtimeDashboard";

export default RealtimeDashboard;
