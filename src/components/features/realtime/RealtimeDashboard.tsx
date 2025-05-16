import React, { useEffect, useMemo, memo } from "react";
import { useStockOperations } from "@/hooks/stock/useStockOperations";
import StockPriceCard from "@/components/features/stock/StockPriceCard";
import SymbolSubscriptionManager from "@/components/features/stock/SymbolSubscriptionManager";

// 로딩 컴포넌트
const LoadingIndicator = memo(() => (
  <div className="loading-indicator">데이터를 불러오는 중...</div>
));
LoadingIndicator.displayName = "LoadingIndicator";

// 에러 컴포넌트
const ErrorContainer = memo(({ error }: { error: string }) => (
  <div className="error-container">
    <h3>오류 발생</h3>
    <p>{error}</p>
  </div>
));
ErrorContainer.displayName = "ErrorContainer";

// 빈 상태 컴포넌트
const EmptyState = memo(() => (
  <div className="empty-state">
    <p>구독 중인 종목이 없습니다.</p>
    <p>위 입력창에서 종목 코드를 입력하여 실시간 시세를 구독해보세요.</p>
  </div>
));
EmptyState.displayName = "EmptyState";

// 주식 그리드 컴포넌트
const StockGrid = memo(({ symbols }: { symbols: string[] }) => (
  <div className="stock-grid">
    {symbols.map((symbol) => (
      <StockPriceCard key={symbol} symbol={symbol} />
    ))}
  </div>
));
StockGrid.displayName = "StockGrid";

// 메인 대시보드 컴포넌트
const RealtimeDashboard: React.FC = () => {
  const { subscribedSymbols } = useStockOperations();
  // 로딩과 에러 상태를 위한 로컬 상태
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 초기 데이터 로드 효과
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        document.title = "실시간 주가 모니터링";
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류 발생");
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  const hasSubscriptions = useMemo(
    () => subscribedSymbols.length > 0,
    [subscribedSymbols.length]
  );

  const showLoading = useMemo(
    () => isLoading && subscribedSymbols.length === 0,
    [isLoading, subscribedSymbols.length]
  );

  const showEmptyState = useMemo(
    () => subscribedSymbols.length === 0 && !isLoading,
    [subscribedSymbols.length, isLoading]
  );

  return (
    <div className="realtime-dashboard">
      <h1>실시간 주가 모니터링</h1>

      <SymbolSubscriptionManager />

      {showLoading && <LoadingIndicator />}
      {error && <ErrorContainer error={error} />}
      {showEmptyState && <EmptyState />}

      {hasSubscriptions && <StockGrid symbols={subscribedSymbols} />}
    </div>
  );
};

RealtimeDashboard.displayName = "RealtimeDashboard";

export default RealtimeDashboard;
