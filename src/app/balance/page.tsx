"use client";

import BalancePage from "@/pages/BalancePage";
import { ErrorProvider } from "@/contexts/ErrorContext";

export default function Page() {
  return (
    <ErrorProvider>
      <BalancePage />
    </ErrorProvider>
  );
}
