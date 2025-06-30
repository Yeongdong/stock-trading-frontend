"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useCallback } from "react";
import OverseasStockOrderForm from "@/components/features/stock/overseas/OverseasStockOrderForm";
import OverseasStockView from "@/components/features/stock/overseas/OverseasStockView";
import { OverseasMarket } from "@/types/domains/stock/overseas";
import { ForeignStockInfo } from "@/types/domains/stock/foreignStock";
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
    market: "nas",
  });

  const stockCode = searchParams.get("stockCode");
  const market = searchParams.get("market") as OverseasMarket;
  const price = searchParams.get("price");

  const chartStockCode = selectedStock.code || stockCode || "";
  const chartStockName = selectedStock.name || "";
  const chartMarket = selectedStock.market || market || "nas";

  const handleStockSelect = useCallback(
    (stock: ForeignStockInfo & { fetchedCurrentPrice?: number }) => {
      const marketMapping: Record<string, OverseasMarket> = {
        NYSE: "nyse",
        NAS: "nas",
        NASDAQ: "nas",
        LSE: "london",
        TSE: "tokyo",
        HKEX: "hongkong",
        HKS: "hongkong",
      };

      const mappedMarket = marketMapping[stock.exchange] || "nas";

      setSelectedStock({
        code: stock.symbol,
        name: stock.description,
        market: mappedMarket,
      });

      const params = new URLSearchParams({
        stockCode: stock.symbol,
        market: mappedMarket,
      });

      const currentPrice = stock.fetchedCurrentPrice || stock.currentPrice;
      if (currentPrice && currentPrice > 0) {
        params.append("price", currentPrice.toString());
      }

      router.replace(`${window.location.pathname}?${params.toString()}`);
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
        <OverseasStockView onStockSelect={handleStockSelect} />
      </div>

      <div className={styles.twoColumnLayout}>
        <div className={styles.orderSection}>
          <OverseasStockOrderForm
            selectedStockCode={selectedStock.code}
            initialStockCode={stockCode || undefined}
            initialMarket={market || "nas"}
            initialPrice={
              price ? parseFloat(price) : selectedStock.code ? 0 : undefined
            }
            onOrderSuccess={handleOrderSuccess}
          />
        </div>

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
              </div>
            ) : (
              <p>종목을 선택해주세요.</p>
            )}
          </div>
        </div>
      </div>

      {/* 기간별 차트 섹션 */}
      <div className={styles.chartSection}>
        <OverseasPriceChart
          stockName={chartStockName}
          stockCode={chartStockCode}
          market={chartMarket}
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
