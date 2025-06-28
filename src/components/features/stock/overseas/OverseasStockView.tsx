import React, { useState } from "react";
import { useOverseasStock } from "@/hooks/stock/useOverseasStock";
import {
  OVERSEAS_MARKETS,
  OverseasMarket,
} from "@/types/domains/stock/overseas";
import styles from "./OverseasStockView.module.css";

/**
 * 해외 주식 통합 뷰 컴포넌트
 * 기존 국내 주식 패턴을 재사용하면서 해외 주식 특화 기능만 추가
 */
const OverseasStockView: React.FC = () => {
  const [selectedMarket, setSelectedMarket] = useState<OverseasMarket | null>(
    null
  );
  const [stockCode, setStockCode] = useState("");
  const overseasStock = useOverseasStock();

  // 시장 선택 핸들러
  const handleMarketSelect = (market: OverseasMarket) => {
    setSelectedMarket(market);
    overseasStock.clearAll();
    setStockCode("");
  };

  // 주식 검색 핸들러
  const handleStockSearch = async (code: string) => {
    if (!selectedMarket || !code.trim()) return;

    setStockCode(code.trim().toUpperCase());
    await overseasStock.currentPrice.fetch(
      code.trim().toUpperCase(),
      selectedMarket
    );
  };

  // 시장별 주식 목록 조회
  const handleLoadMarketStocks = async () => {
    if (!selectedMarket) return;
    await overseasStock.search.fetch(selectedMarket);
  };

  const getSearchPlaceholder = () => {
    if (!selectedMarket) return "시장을 먼저 선택해주세요";

    switch (selectedMarket) {
      case "nas":
      case "nyse":
        return "예: AAPL, MSFT, GOOGL";
      case "tokyo":
        return "예: 7203, 6758, 9984";
      case "london":
        return "예: LLOY, BP, ULVR";
      case "hongkong":
        return "예: 0700, 0941, 0388";
      default:
        return "종목코드를 입력하세요";
    }
  };

  return (
    <div className={styles.overseasStockView}>
      {/* 시장 선택 영역 */}
      <section className={styles.marketSection}>
        <h2 className={styles.sectionTitle}>해외 주식 시장</h2>
        <div className={styles.marketGrid}>
          {Object.entries(OVERSEAS_MARKETS).map(([marketKey, marketInfo]) => {
            const market = marketKey as OverseasMarket;
            const isSelected = selectedMarket === market;

            return (
              <button
                key={market}
                className={`${styles.marketCard} ${
                  isSelected ? styles.selected : ""
                }`}
                onClick={() => handleMarketSelect(market)}
              >
                <div className={styles.marketName}>{marketInfo.name}</div>
                <div className={styles.marketDetails}>
                  <span>{marketInfo.currency}</span>
                  <span>
                    {marketInfo.tradingHours.open} -{" "}
                    {marketInfo.tradingHours.close}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 선택된 시장이 있을 때만 표시 */}
      {selectedMarket && (
        <>
          {/* 주식 검색 영역 */}
          <section className={styles.searchSection}>
            <h3 className={styles.sectionTitle}>
              {OVERSEAS_MARKETS[selectedMarket].name} 주식 검색
            </h3>

            <div className={styles.searchForm}>
              <input
                type="text"
                value={stockCode}
                onChange={(e) => setStockCode(e.target.value.toUpperCase())}
                placeholder={getSearchPlaceholder()}
                className={styles.searchInput}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleStockSearch(stockCode)
                }
              />
              <button
                onClick={() => handleStockSearch(stockCode)}
                disabled={
                  !stockCode.trim() || overseasStock.currentPrice.isLoading
                }
                className={styles.searchButton}
              >
                {overseasStock.currentPrice.isLoading ? "검색중..." : "검색"}
              </button>
            </div>
          </section>

          {/* 현재가 정보 표시 */}
          {overseasStock.currentPrice.data && (
            <section className={styles.priceSection}>
              <div className={styles.stockInfo}>
                <h3>{overseasStock.currentPrice.data.stockName}</h3>
                <span className={styles.stockCode}>
                  ({overseasStock.currentPrice.data.stockCode})
                </span>
              </div>

              <div className={styles.priceInfo}>
                <div className={styles.currentPrice}>
                  {new Intl.NumberFormat("ko-KR", {
                    style: "currency",
                    currency: overseasStock.currentPrice.data.currency,
                    minimumFractionDigits: 2,
                  }).format(overseasStock.currentPrice.data.currentPrice)}
                </div>

                <div
                  className={`${styles.priceChange} ${
                    overseasStock.currentPrice.data.changeType === "rise"
                      ? styles.positive
                      : overseasStock.currentPrice.data.changeType === "fall"
                      ? styles.negative
                      : styles.neutral
                  }`}
                >
                  <span>
                    {overseasStock.currentPrice.data.priceChange > 0 ? "+" : ""}
                    {overseasStock.currentPrice.data.priceChange.toFixed(2)}
                  </span>
                  <span>
                    ({overseasStock.currentPrice.data.changeRate > 0 ? "+" : ""}
                    {overseasStock.currentPrice.data.changeRate.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span>시가</span>
                  <span>
                    {overseasStock.currentPrice.data.openPrice.toFixed(2)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span>고가</span>
                  <span>
                    {overseasStock.currentPrice.data.highPrice.toFixed(2)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span>저가</span>
                  <span>
                    {overseasStock.currentPrice.data.lowPrice.toFixed(2)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span>거래량</span>
                  <span>
                    {overseasStock.currentPrice.data.volume.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* 시장별 주식 목록 */}
          <section className={styles.marketStocksSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>
                {OVERSEAS_MARKETS[selectedMarket].name} 주요 종목
              </h3>
              <button
                onClick={handleLoadMarketStocks}
                disabled={overseasStock.search.isLoading}
                className={styles.loadButton}
              >
                {overseasStock.search.isLoading ? "로딩중..." : "목록 조회"}
              </button>
            </div>

            {overseasStock.search.results.length > 0 && (
              <div className={styles.stockGrid}>
                {overseasStock.search.results.map((stock) => (
                  <div
                    key={stock.code}
                    className={styles.stockCard}
                    onClick={() => handleStockSearch(stock.code)}
                  >
                    <div className={styles.stockName}>{stock.name}</div>
                    <div className={styles.stockCodeText}>({stock.code})</div>
                    <div className={styles.stockSector}>{stock.sector}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* 에러 표시 */}
      {overseasStock.hasAnyError && (
        <div className={styles.errorMessage}>
          {overseasStock.currentPrice.error || overseasStock.search.error}
        </div>
      )}
    </div>
  );
};

export default OverseasStockView;
