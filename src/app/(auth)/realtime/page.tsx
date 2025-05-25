"use client";

import RealtimeDashboard from "@/components/features/realtime/RealtimeDashboard";
import { StockSubscriptionProvider } from "@/contexts/StockSubscriptionContext";

export default function RealtimePage() {
  return (
    <StockSubscriptionProvider>
      <RealtimeDashboard />
    </StockSubscriptionProvider>
  );
}
