"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useCallback } from "react";
import OverseasStockOrderForm from "@/components/features/stock/overseas/OverseasStockOrderForm";
import { OverseasMarket } from "@/types/domains/stock/overseas";
import { ForeignStockInfo } from "@/types/domains/stock/foreignStock";
import styles from "./page.module.css";
import OverseasPriceChart from "@/components/features/stock/overseas/OverseasPriceChart";
import ForeignStockSearch from "@/components/features/stock/overseas/ForeignStockSearch";

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

  const handleForeignStockSelect = useCallback(
    (stock: ForeignStockInfo) => {
      const marketMapping: Record<string, OverseasMarket> = {
        NYSE: "nyse",
        NASDAQ: "nasdaq",
        LSE: "london",
        TSE: "tokyo",
        HKEX: "hongkong",
      };

      const mappedMarket = marketMapping[stock.exchange] || "nasdaq";

      setSelectedStock({
        code: stock.symbol,
        name: stock.description,
        market: mappedMarket,
      });

      const params = new URLSearchParams({
        stockCode: stock.symbol,
        market: mappedMarket,
      });
      router.replace(`${window.location.pathname}?${params.toString()}`);
    },
    [router]
  );

  const handleOrderRequest = useCallback(
    (stockCode: string, market: OverseasMarket, orderPrice: number) => {
      const params = new URLSearchParams({
        stockCode,
        market,
        price: orderPrice.toString(),
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

  const handleOrderSuccess = useCallback(() => {
    console.log("해외 주식 주문 성공!");
  }, []);

  return (
    <div className={styles.overseasPageContainer}>
      <h1 className={styles.pageTitle}>해외 주식</h1>

      {/* 검색 영역 */}
      <div className={styles.stockSearchSection}>
        <ForeignStockSearch onStockSelect={handleForeignStockSelect} />
      </div>

      <div className={styles.twoColumnLayout}>
        <OverseasStockOrderForm
          initialStockCode={initialData.stockCode}
          initialMarket={initialData.market}
          onOrderSuccess={handleOrderSuccess}
        />

        <div className={styles.priceInfoSection}>
          <div className={styles.marketInfoCard}>
            <h3>선택된 종목</h3>
            {selectedStock.code ? (
              <div className={styles.selectedStockInfo}>
                <p>
                  <strong>종목:</strong> {selectedStock.name}
                </p>
                <p>
                  <strong>코드:</strong> {selectedStock.code}
                </p>
                <p>
                  <strong>시장:</strong> {selectedStock.market.toUpperCase()}
                </p>
                <button
                  onClick={() =>
                    handleOrderRequest(
                      selectedStock.code,
                      selectedStock.market,
                      100
                    )
                  }
                  className={styles.quickOrderButton}
                >
                  빠른 주문
                </button>
              </div>
            ) : (
              <p>종목을 선택해주세요.</p>
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
