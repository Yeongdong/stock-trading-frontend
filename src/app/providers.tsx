"use client";

import { ErrorProvider } from "@/contexts/ErrorContext";
import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";
import ErrorDisplayContainer from "@/components/ui/ErrorDisplayContainer";

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
