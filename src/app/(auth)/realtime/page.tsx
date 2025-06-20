"use client";

import React, { useEffect } from "react";
import RealtimeDashboard from "@/components/features/realtime/RealtimeDashboard";
import { StockSubscriptionProvider } from "@/contexts/StockSubscriptionContext";
import { StockDataProvider, useStockData } from "@/contexts/StockDataContext";
import { ChartDataProvider, useChartData } from "@/contexts/ChartDataContext";
import { RealtimePriceProvider } from "@/contexts/RealtimePriceContext";
import { useRealtimeConnection } from "@/hooks/realtime/useRealtimeConnection";
import MarketClosedNotice from "@/components/ui/MarketClosedNotice";
import styles from "./page.module.css";
import { useMarketStatus } from "@/hooks/realtime/useMarketStatus";

function RealtimeProviderConnector({
  children,
}: {
  children: React.ReactNode;
}) {
  const { updateStockData } = useStockData();
  const { updateChartData } = useChartData();

  return (
    <RealtimePriceProvider
      callbacks={{
        onStockDataUpdate: updateStockData,
        onChartDataUpdate: updateChartData,
      }}
    >
      {children}
    </RealtimePriceProvider>
  );
}

function RealtimeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ChartDataProvider>
      <StockDataProvider>
        <RealtimeProviderConnector>
          <StockSubscriptionProvider>{children}</StockSubscriptionProvider>
        </RealtimeProviderConnector>
      </StockDataProvider>
    </ChartDataProvider>
  );
}

function RealtimeConnectionManager({
  children,
}: {
  children: React.ReactNode;
}) {
  const { connect, disconnect } = useRealtimeConnection();

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return <>{children}</>;
}

export default function RealtimePage() {
  const { isOpen, statusText, statusIcon } = useMarketStatus();

  if (!isOpen)
    return (
      <div className={styles.container}>
        <MarketClosedNotice
          statusIcon={statusIcon}
          title="실시간 서비스 일시 중단"
          statusText={statusText}
          description="한국거래소는 평일 오전 9시부터 오후 3시 30분까지 운영됩니다. 장 시간 외에는 실시간 데이터를 제공하지 않습니다."
        />
      </div>
    );

  return (
    <div className={styles.container}>
      <RealtimeConnectionManager>
        <RealtimeProviders>
          <RealtimeDashboard />
        </RealtimeProviders>
      </RealtimeConnectionManager>
    </div>
  );
}
