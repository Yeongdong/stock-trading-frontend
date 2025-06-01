"use client";

import OrderExecutionView from "@/components/features/orderExecution/OrderExecutionView";

export default function OrderExecutionPage() {
  return (
    <div className="container">
      <h1>주문체결내역 조회</h1>
      <OrderExecutionView />
    </div>
  );
}
