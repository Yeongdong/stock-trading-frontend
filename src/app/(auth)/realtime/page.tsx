"use client";

import React, { useEffect } from "react";
import RealtimeDashboard from "@/components/features/realtime/RealtimeDashboard";
import { StockSubscriptionProvider } from "@/contexts/StockSubscriptionContext";
import { StockDataProvider, useStockData } from "@/contexts/StockDataContext";
import { ChartDataProvider, useChartData } from "@/contexts/ChartDataContext";
import { RealtimePriceProvider } from "@/contexts/RealtimePriceContext";
import { realtimeSocketService } from "@/services/realtime/realtimeSocketService";
import { useMarketGuard } from "@/hooks/realtime/useMarketGuard";
import MarketClosedNotice from "@/components/ui/MarketClosedNotice";

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

export default function RealtimePage() {
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

  return (
    <ChartDataProvider>
      <StockDataProvider>
        <StockSubscriptionProvider>
          <RealtimeProviderConnector>
            <RealtimeDashboard />
          </RealtimeProviderConnector>
        </StockSubscriptionProvider>
      </StockDataProvider>
    </ChartDataProvider>
  );
}
