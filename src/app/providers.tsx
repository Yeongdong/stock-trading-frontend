"use client";

import { ErrorProvider } from "@/contexts/ErrorContext";
import { StockDataProvider } from "@/contexts/StockDataContext";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";

export default function Providers({ children }: { children: React.ReactNode }) {
  useNetworkStatus();

  return (
    <ErrorProvider>
      <StockDataProvider>
        {children}
        <ErrorDisplay />
      </StockDataProvider>
    </ErrorProvider>
  );
}
