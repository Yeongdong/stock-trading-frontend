"use client";

import { ErrorProvider } from "@/contexts/ErrorContext";
import { StockSubscriptionProvider } from "@/contexts/StockSubscriptionContext";
import { RealtimePriceProvider } from "@/contexts/RealtimePriceContext";
import { ChartDataProvider } from "@/contexts/ChartDataContext";
import { StockDataProvider } from "@/contexts/StockDataContext";
import RealtimeDataSynchronizer from "@/components/system/RealtimeDataSynchronizer";
import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorDisplayContainer from "@/components/common/ErrorDisplayContainer";

function NetworkStatusMonitor() {
  useNetworkStatus();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorProvider>
      <NetworkStatusMonitor />
      <AuthProvider>
        <StockSubscriptionProvider>
          <RealtimePriceProvider>
            <ChartDataProvider>
              <StockDataProvider>
                {/* 데이터 동기화 컴포넌트 - UI 렌더링 없음 */}
                <RealtimeDataSynchronizer />
                {/* 실제 UI */}
                {children}
                <ErrorDisplayContainer />
              </StockDataProvider>
            </ChartDataProvider>
          </RealtimePriceProvider>
        </StockSubscriptionProvider>
      </AuthProvider>
    </ErrorProvider>
  );
}
