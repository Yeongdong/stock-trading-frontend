"use client";

import RealtimeDashboard from "@/components/features/realtime/RealtimeDashboard";
import { StockSubscriptionProvider } from "@/contexts/StockSubscriptionContext";
import { StockDataProvider } from "@/contexts/StockDataContext";
import { ChartDataProvider } from "@/contexts/ChartDataContext";
import { RealtimePriceProvider } from "@/contexts/RealtimePriceContext";

export default function RealtimePage() {
  return (
    <RealtimePriceProvider>
      <StockDataProvider>
        <ChartDataProvider>
          <StockSubscriptionProvider>
            <RealtimeDashboard />
          </StockSubscriptionProvider>
        </ChartDataProvider>
      </StockDataProvider>
    </RealtimePriceProvider>
  );
}
