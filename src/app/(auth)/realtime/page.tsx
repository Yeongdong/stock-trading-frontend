"use client";

import RealtimeDashboard from "@/components/features/realtime/RealtimeDashboard";
import RealtimeDataSynchronizer from "@/components/system/RealtimeDataSynchronizer";
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
            {/* 데이터 동기화 컴포넌트 - 모든 Provider 내부에 위치 */}
            <RealtimeDataSynchronizer />
            <RealtimeDashboard />
          </StockSubscriptionProvider>
        </ChartDataProvider>
      </StockDataProvider>
    </RealtimePriceProvider>
  );
}
