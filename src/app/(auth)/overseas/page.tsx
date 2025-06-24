// src/app/(auth)/overseas/page.tsx

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useCallback } from "react";
import OverseasOrderForm from "@/components/features/stock/overseas/OverseasOrderForm";
import OverseasStockSearch from "@/components/features/stock/overseas/OverseasStockSearch";
import { OverseasMarket } from "@/types/domains/stock/overseas";
import styles from "./page.module.css";
import OverseasPriceChart from "@/components/features/stock/overseas/OverseasPriceChart";

interface SelectedOverseasStock {
  code: string;
  name: string;
  market: OverseasMarket;
}

function OverseasPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedStock, setSelectedStock] = useState<SelectedOverseasStock>({
    code: "",
    name: "",
    market: "nasdaq",
  });

  const stockCode = searchParams.get("stockCode");
  const market = searchParams.get("market") as OverseasMarket;
  const price = searchParams.get("price");

  const initialData = {
    stockCode: selectedStock.code || stockCode || undefined,
    market: selectedStock.market || market || "nasdaq",
    orderPrice: price ? parseFloat(price) : undefined,
  };

  const handleStockSelect = useCallback(
    (stock: { code: string; name: string; market: OverseasMarket }) => {
      setSelectedStock(stock);
    },
    []
  );

  const handleOrderRequest = useCallback(
    (stockCode: string, market: OverseasMarket, orderPrice: number) => {
      // URL 파라미터로 주문 폼에 데이터 전달
      const params = new URLSearchParams({
        stockCode,
        market,
        price: orderPrice.toString(),
      });

      // 현재 페이지 URL 업데이트 (새로고침 없이)
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.replace(newUrl);

      // 주문 폼 섹션으로 스크롤
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

  const handleOrderSuccess = useCallback(() => {
    console.log("해외 주식 주문 성공!");
  }, []);

  return (
    <div className={styles.overseasPageContainer}>
      <h1 className={styles.pageTitle}>해외 주식</h1>

      <div className={styles.stockSearchSection}>
        <OverseasStockSearch onStockSelect={handleStockSelect} />
      </div>

      <div className={styles.twoColumnLayout}>
        <div className={styles.orderSection}>
          <OverseasOrderForm
            initialStockCode={initialData.stockCode}
            initialMarket={initialData.market}
            onOrderSuccess={handleOrderSuccess}
          />
        </div>

        <div className={styles.priceInfoSection}>
          <div className={styles.marketInfoCard}>
            <h3>시장 정보</h3>
            <p>해외 주식 시장 현황과 주요 정보가 표시됩니다.</p>
            {selectedStock.code && (
              <button
                onClick={() =>
                  handleOrderRequest(
                    selectedStock.code,
                    selectedStock.market,
                    100 // 임시 가격
                  )
                }
                className={styles.quickOrderButton}
              >
                빠른 주문
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.chartSection}>
        <OverseasPriceChart
          stockName={selectedStock.name}
          stockCode={selectedStock.code}
          market={selectedStock.market}
        />
      </div>
    </div>
  );
}

export default function OverseasPage() {
  return (
    <Suspense fallback={<div className="loading">로딩중...</div>}>
      <OverseasPageContent />
    </Suspense>
  );
}
