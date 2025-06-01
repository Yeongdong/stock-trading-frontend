"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import EnhancedStockOrderForm from "@/components/features/stock/EnhancedStockOrderForm";

function OrderPageContent() {
  const searchParams = useSearchParams();

  const stockCode = searchParams.get("stockCode");
  const orderPrice = searchParams.get("orderPrice");
  const maxQuantity = searchParams.get("maxQuantity");

  const initialData = {
    stockCode: stockCode || undefined,
    orderPrice: orderPrice ? parseInt(orderPrice) : undefined,
    maxQuantity: maxQuantity ? parseInt(maxQuantity) : undefined,
  };

  return (
    <div className="container">
      <h1>주식 주문</h1>
      <EnhancedStockOrderForm initialData={initialData} />
    </div>
  );
}

export default function StockOrderPage() {
  return (
    <Suspense fallback={<div>로딩중...</div>}>
      <OrderPageContent />
    </Suspense>
  );
}
