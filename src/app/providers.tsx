"use client";

import { ErrorProvider } from "@/contexts/ErrorContext";
import { useNetworkStatus } from "@/hooks/common/useNetworkStatus";

function NetworkStatusMonitor() {
  useNetworkStatus();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorProvider>
      <NetworkStatusMonitor />
      {children}
    </ErrorProvider>
  );
}
