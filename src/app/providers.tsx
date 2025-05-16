"use client";

import { ErrorProvider } from "@/contexts/ErrorContext";
import { StockSubscriptionProvider } from "@/contexts/StockSubscriptionContext";
import { RealtimePriceProvider } from "@/contexts/RealtimePriceContext";
import { ChartDataProvider } from "@/contexts/ChartDataContext";
import { StockDataProvider } from "@/contexts/StockDataContext";
import RealtimeDataSynchronizer from "@/components/system/RealtimeDataSynchronizer";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";

export default function Providers({ children }: { children: React.ReactNode }) {
  useNetworkStatus();

  return (
    <ErrorProvider>
      <StockSubscriptionProvider>
        <RealtimePriceProvider>
          <ChartDataProvider>
            <StockDataProvider>
              {/* 데이터 동기화 컴포넌트 - UI 렌더링 없음 */}
              <RealtimeDataSynchronizer />
              {/* 실제 UI */}
              {children}
              <ErrorDisplay />
            </StockDataProvider>
          </ChartDataProvider>
        </RealtimePriceProvider>
      </StockSubscriptionProvider>
    </ErrorProvider>
  );
}
