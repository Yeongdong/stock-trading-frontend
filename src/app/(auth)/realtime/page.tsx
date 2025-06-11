"use client";

import React from "react";
import RealtimeDashboard from "@/components/features/realtime/RealtimeDashboard";
import { StockSubscriptionProvider } from "@/contexts/StockSubscriptionContext";
import { StockDataProvider, useStockData } from "@/contexts/StockDataContext";
import { ChartDataProvider, useChartData } from "@/contexts/ChartDataContext";
import { RealtimePriceProvider } from "@/contexts/RealtimePriceContext";

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
