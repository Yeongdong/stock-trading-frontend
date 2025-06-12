"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import EnhancedStockOrderForm from "@/components/features/stock/EnhancedStockOrderForm";
import StockSearchView from "@/components/features/stock/StockSearchView";

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
      <StockSearchView />
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
