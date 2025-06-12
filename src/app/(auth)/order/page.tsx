"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import EnhancedStockOrderForm from "@/components/features/stock/EnhancedStockOrderForm";
import StockSearchView from "@/components/features/stock/StockSearchView";
import BuyableInquiryView from "@/components/features/trading/BuyableInquiryView";
import { StockSearchResult } from "@/types/stock/search";
import styles from "./page.module.css";

function OrderPageContent() {
  const searchParams = useSearchParams();
  const [selectedStockCode, setSelectedStockCode] = useState<string>("");

  const stockCode = searchParams.get("stockCode");
  const orderPrice = searchParams.get("orderPrice");
  const maxQuantity = searchParams.get("maxQuantity");

  const initialData = {
    stockCode: selectedStockCode || stockCode || undefined,
    orderPrice: orderPrice ? parseInt(orderPrice) : undefined,
    maxQuantity: maxQuantity ? parseInt(maxQuantity) : undefined,
  };

  const handleStockSelect = (stock: StockSearchResult) => {
    setSelectedStockCode(stock.code);
  };

  return (
    <div className={styles.orderPageContainer}>
      <h1 className={styles.pageTitle}>주식 주문</h1>

      <div className={styles.stockSearchSection}>
        <StockSearchView onStockSelect={handleStockSelect} />
      </div>

      <div className={styles.twoColumnLayout}>
        <div className={styles.orderSection}>
          <EnhancedStockOrderForm
            initialData={initialData}
            selectedStockCode={selectedStockCode}
          />
        </div>

        <div className={styles.buyableInquirySection}>
          <BuyableInquiryView selectedStockCode={selectedStockCode} />
        </div>
      </div>
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
