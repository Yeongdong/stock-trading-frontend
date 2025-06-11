"use client";

import React, { useEffect } from "react";
import RealtimeDashboard from "@/components/features/realtime/RealtimeDashboard";
import { StockSubscriptionProvider } from "@/contexts/StockSubscriptionContext";
import { StockDataProvider, useStockData } from "@/contexts/StockDataContext";
import { ChartDataProvider, useChartData } from "@/contexts/ChartDataContext";
import { RealtimePriceProvider } from "@/contexts/RealtimePriceContext";
import { realtimeSocketService } from "@/services/realtime/realtimeSocketService";
import { useMarketGuard } from "@/hooks/realtime/useMarketGuard";
import MarketClosedNotice from "@/components/common/MarketClosedNotice";

function RealtimeProviderConnector({
  children,
}: {
  children: React.ReactNode;
}) {
  const { updateStockData } = useStockData();
  const { updateChartData } = useChartData();

  return (
    <RealtimePriceProvider
      contextUpdaters={{
        updateStockData,
        updateChartData,
      }}
    >
      {children}
    </RealtimePriceProvider>
  );
}

function RealtimeContent() {
  const marketInfo = useMarketGuard();

  useEffect(() => {
    if (marketInfo.isOpen) {
      realtimeSocketService.start();
      return () => {
        realtimeSocketService.stop();
      };
    }
  }, [marketInfo.isOpen]);

  if (!marketInfo.isOpen) {
    return (
      <MarketClosedNotice
        statusText={marketInfo.statusText}
        statusIcon={marketInfo.statusIcon}
      />
    );
  }

  return <RealtimeDashboard />;
}

export default function RealtimePage() {
  return (
    <ChartDataProvider>
      <StockDataProvider>
        <StockSubscriptionProvider>
          <RealtimeProviderConnector>
            <RealtimeContent />
          </RealtimeProviderConnector>
        </StockSubscriptionProvider>
      </StockDataProvider>
    </ChartDataProvider>
  );
}
