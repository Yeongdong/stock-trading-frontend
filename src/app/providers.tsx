"use client";

import { ErrorProvider } from "@/contexts/ErrorContext";
import { StockDataProvider } from "@/contexts/StockDataContext";
import { RealtimePriceProvider } from "@/contexts/RealtimePriceContext";
import { ChartDataProvider } from "@/contexts/ChartDataContext";
import { StockSubscriptionProvider } from "@/contexts/StockSubscriptionContext";
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
              {children}
              <ErrorDisplay />
            </StockDataProvider>
          </ChartDataProvider>
        </RealtimePriceProvider>
      </StockSubscriptionProvider>
    </ErrorProvider>
  );
}
