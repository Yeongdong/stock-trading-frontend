"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import EnhancedStockOrderForm from "@/components/features/stock/order/StockOrderForm";
import StockSearchView from "@/components/features/stock/search/StockSearchView";
import BuyableInquiryView from "@/components/features/trading/BuyableInquiryView";
import { StockSearchResult } from "@/types/domains/stock/search";
import styles from "./page.module.css";
import PeriodPriceChart from "@/components/features/stock/chart/PeriodPriceChart";

interface StockInfo {
  code: string;
  name: string;
}

function OrderPageContent() {
  const searchParams = useSearchParams();
  const [selectedStock, setSelectedStock] = useState<StockInfo>({
    code: "",
    name: "",
  });
  const stockCode = searchParams.get("stockCode");
  const orderPrice = searchParams.get("orderPrice");
  const maxQuantity = searchParams.get("maxQuantity");

  const initialData = {
    stockCode: selectedStock.code || stockCode || undefined,
    orderPrice: orderPrice ? parseInt(orderPrice) : undefined,
    maxQuantity: maxQuantity ? parseInt(maxQuantity) : undefined,
  };

  const handleStockSelect = (stock: StockSearchResult) => {
    setSelectedStock(stock);
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
            selectedStockCode={selectedStock.code}
          />
        </div>

        <div className={styles.buyableInquirySection}>
          <BuyableInquiryView selectedStockCode={selectedStock.code} />
        </div>
      </div>

      <div className={styles.chartSection}>
        <PeriodPriceChart
          stockName={selectedStock.name}
          stockCode={selectedStock.code}
        />
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
