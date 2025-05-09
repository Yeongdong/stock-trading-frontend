// src/components/features/realtime/RealtimeDashboard.tsx
import React, { useEffect } from "react";
import { useStockData } from "@/contexts/StockDataContext";
import StockPriceCard from "@/components/features/stock/StockPriceCard";
import SymbolSubscriptionManager from "@/components/features/stock/SymbolSubscriptionManager";

const RealtimeDashboard: React.FC = () => {
  const { subscribedSymbols, isLoading, error } = useStockData();

  useEffect(() => {
    document.title = "실시간 주가 모니터링";
  }, []);

  return (
    <div className="realtime-dashboard">
      <h1>실시간 주가 모니터링</h1>

      <SymbolSubscriptionManager />

      {isLoading && subscribedSymbols.length === 0 && (
        <div className="loading-indicator">데이터를 불러오는 중...</div>
      )}

      {error && (
        <div className="error-container">
          <h3>오류 발생</h3>
          <p>{error}</p>
        </div>
      )}

      {subscribedSymbols.length === 0 && !isLoading && (
        <div className="empty-state">
          <p>구독 중인 종목이 없습니다.</p>
          <p>위 입력창에서 종목 코드를 입력하여 실시간 시세를 구독해보세요.</p>
        </div>
      )}

      <div className="stock-grid">
        {subscribedSymbols.map((symbol) => (
          <StockPriceCard key={symbol} symbol={symbol} />
        ))}
      </div>
    </div>
  );
};

export default RealtimeDashboard;
