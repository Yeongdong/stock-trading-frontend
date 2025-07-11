"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useCallback } from "react";
import StockOrderForm from "@/components/features/stock/order/StockOrderForm";
import StockSearchView from "@/components/features/stock/search/StockSearchView";
import BuyableInquiry from "@/components/features/trading/BuyableInquiry";
import { StockSearchResult } from "@/types/domains/stock/search";
import { StockInfo } from "@/types/domains/stock";
import styles from "./page.module.css";
import PeriodPriceChart from "@/components/features/stock/chart/PeriodPriceChart";

function OrderPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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

  const handleStockSelect = useCallback((stock: StockSearchResult) => {
    setSelectedStock({
      code: stock.code,
      name: stock.name,
    });
  }, []);

  const handleOrderRequest = useCallback(
    (stockCode: string, orderPrice: number, maxQuantity: number) => {
      const params = new URLSearchParams({
        stockCode,
        orderPrice: orderPrice.toString(),
        maxQuantity: maxQuantity.toString(),
      });

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.replace(newUrl);

      const orderSection = document.querySelector(`.${styles.orderSection}`);
      if (orderSection) {
        orderSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    },
    [router]
  );

  return (
    <div className={styles.orderPageContainer}>
      <h1 className={styles.pageTitle}>국내 주식</h1>

      <div className={styles.stockSearchSection}>
        <StockSearchView onStockSelect={handleStockSelect} />
      </div>

      <div className={styles.twoColumnLayout}>
        <div className={styles.orderSection}>
          <StockOrderForm
            initialData={initialData}
            selectedStockCode={selectedStock.code}
          />
        </div>

        <div className={styles.buyableInquirySection}>
          <BuyableInquiry
            selectedStockCode={selectedStock.code}
            onOrderRequest={handleOrderRequest}
          />
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
