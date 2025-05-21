"use client";

import StockOrderForm from "@/components/features/stock/StockOrderForm";
import AuthGuard from "@/components/common/AuthGuard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="container">
        <h1>대시보드</h1>
        <StockOrderForm />
      </div>
    </AuthGuard>
  );
}
