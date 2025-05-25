"use client";

import { ErrorProvider } from "@/contexts/ErrorContext";
import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";
import ErrorDisplayContainer from "@/components/common/ErrorDisplayContainer";

function NetworkStatusMonitor() {
  useNetworkStatus();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorProvider>
      <NetworkStatusMonitor />
      {children}
      <ErrorDisplayContainer />
    </ErrorProvider>
  );
}
