"use client";

import RealtimeDashboard from "@/components/features/realtime/RealtimeDashboard";
import RealtimeDataSynchronizer from "@/components/system/RealtimeDataSynchronizer";
import RealtimeDebugPanel from "@/components/debug/RealtimeDebugPanel";
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
            {/* 데이터 동기화 컴포넌트 */}
            <RealtimeDataSynchronizer />

            {/* 디버그 패널 (개발 환경에서만) */}
            {process.env.NODE_ENV === "development" && <RealtimeDebugPanel />}

            <RealtimeDashboard />
          </StockSubscriptionProvider>
        </ChartDataProvider>
      </StockDataProvider>
    </RealtimePriceProvider>
  );
}
