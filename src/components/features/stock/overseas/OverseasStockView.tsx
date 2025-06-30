import React, { useState } from "react";
import { useOverseasStock } from "@/hooks/stock/useOverseasStock";
import { useForeignStockSearch } from "@/hooks/stock/useForeignStockSearch";
import {
  OVERSEAS_MARKETS,
  OverseasMarket,
} from "@/types/domains/stock/overseas";
import { ForeignStockInfo } from "@/types/domains/stock/foreignStock";
import { formatCurrency } from "@/utils/formatters";
import styles from "./OverseasStockView.module.css";

interface OverseasStockViewProps {
  onStockSelect?: (stock: ForeignStockInfo) => void;
}

/**
 * 해외 주식 통합 뷰 컴포넌트
 * 시장 선택 + 검색 + 결과 리스트 + 상세 조회 통합
 */
const OverseasStockView: React.FC<OverseasStockViewProps> = ({
  onStockSelect,
}) => {
  const [selectedMarket, setSelectedMarket] = useState<OverseasMarket | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const overseasStock = useOverseasStock();
  const foreignStockSearch = useForeignStockSearch();

  // 시장 매핑 (OverseasMarket -> 백엔드 enum)
  const getSearchMarket = (market: OverseasMarket): string => {
    const marketMap: Record<OverseasMarket, string> = {
      nas: "nasdaq", // nas → nasdaq
      nyse: "nyse", // nyse → nyse
      tokyo: "tokyo", // tokyo → tokyo
      london: "london", // london → london
      hongkong: "hongkong", // hongkong → hongkong
    };
    return marketMap[market];
  };

  // 백엔드 API용 시장 매핑 (OverseasMarket -> 백엔드 Market enum)
  const getBackendMarket = (market: OverseasMarket): string => {
    const marketMap: Record<OverseasMarket, string> = {
      nas: "Nasdaq", // nas → Nasdaq
      nyse: "Nyse", // nyse → Nyse
      tokyo: "Tokyo", // tokyo → Tokyo
      london: "London", // london → London
      hongkong: "Hongkong", // hongkong → Hongkong
    };
    return marketMap[market];
  };

  // 시장 선택 핸들러
  const handleMarketSelect = (market: OverseasMarket) => {
    setSelectedMarket(market);
    overseasStock.clearAll();
    foreignStockSearch.clearResults();
    setSearchQuery("");
    setShowResults(false);
  };

  // 종목 검색 핸들러
  const handleSearch = async (query: string) => {
    if (!selectedMarket || !query.trim()) return;

    setSearchQuery(query.trim());
    setShowResults(true);

    const searchMarket = getSearchMarket(selectedMarket);
    await foreignStockSearch.searchStocks({
      market: searchMarket,
      query: query.trim(),
      limit: 50,
    });
  };

  // 검색 결과에서 종목 선택 시
  const handleStockSelect = async (stock: ForeignStockInfo) => {
    if (!selectedMarket) return;

    // 상위 컴포넌트에 종목 선택 정보 전달
    onStockSelect?.(stock);

    setShowResults(false);

    // 백엔드 API용 시장 코드로 변환하여 현재가 조회
    const backendMarket = getBackendMarket(selectedMarket);
    await overseasStock.currentPrice.fetch(
      stock.symbol,
      backendMarket as OverseasMarket
    );
  };

  const getSearchPlaceholder = () => {
    if (!selectedMarket) return "시장을 먼저 선택하세요";

    switch (selectedMarket) {
      case "nas":
      case "nyse":
        return "예: AAPL, MSFT, GOOGL 또는 Apple, Microsoft";
      case "tokyo":
        return "예: 7203, 6758, 9984 또는 Toyota, Sony";
      case "london":
        return "예: LLOY, BP, ULVR 또는 Lloyds, BP";
      case "hongkong":
        return "예: 0700, 0941, 0388 또는 Tencent";
      default:
        return "종목코드 또는 종목명을 입력하세요";
    }
  };

  return (
    <div className={styles.overseasStockView}>
      <h2 className={styles.sectionTitle}>해외 주식 검색</h2>

      {/* 시장 선택 및 검색 영역 */}
      <div className={styles.searchForm}>
        <div className={styles.marketSelectContainer}>
          <label htmlFor="market-select" className={styles.selectLabel}>
            거래소
          </label>
          <select
            id="market-select"
            value={selectedMarket || ""}
            onChange={(e) => {
              const market = e.target.value as OverseasMarket;
              if (market) {
                handleMarketSelect(market);
              }
            }}
            className={styles.marketSelect}
          >
            <option value="">시장 선택</option>
            {Object.entries(OVERSEAS_MARKETS).map(([marketKey, marketInfo]) => {
              const market = marketKey as OverseasMarket;
              return (
                <option key={market} value={market}>
                  {marketInfo.name}
                </option>
              );
            })}
          </select>
        </div>

        <div className={styles.searchInputContainer}>
          <label htmlFor="search-input" className={styles.selectLabel}>
            종목 검색
          </label>
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              selectedMarket ? getSearchPlaceholder() : "시장을 먼저 선택하세요"
            }
            className={styles.searchInput}
            disabled={!selectedMarket}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                const value = e.currentTarget.value.trim();
                if (value && selectedMarket) {
                  handleSearch(value);
                }
              }
            }}
          />
        </div>

        <button
          onClick={() => {
            if (searchQuery.trim() && selectedMarket) {
              handleSearch(searchQuery);
            }
          }}
          disabled={
            !searchQuery.trim() ||
            !selectedMarket ||
            foreignStockSearch.isLoading
          }
          className={styles.searchButton}
        >
          {foreignStockSearch.isLoading ? "검색중..." : "검색"}
        </button>
      </div>

      {/* 선택된 시장이 있을 때만 검색 결과 및 상세 정보 표시 */}
      {selectedMarket && (
        <>
          {/* 검색 결과 리스트 */}
          {showResults && foreignStockSearch.results && (
            <section className={styles.searchResultsSection}>
              <div className={styles.resultsHeader}>
                <h3 className={styles.sectionTitle}>
                  검색 결과 ({foreignStockSearch.results.count}개)
                </h3>
                <button
                  onClick={() => {
                    foreignStockSearch.clearResults();
                    setSearchQuery("");
                    setShowResults(false);
                  }}
                  className={styles.clearButton}
                >
                  결과 지우기
                </button>
              </div>

              {foreignStockSearch.error && (
                <div className={styles.error}>{foreignStockSearch.error}</div>
              )}

              {foreignStockSearch.isLoading ? (
                <div className={styles.loading}>검색 중...</div>
              ) : foreignStockSearch.results.stocks.length === 0 ? (
                <div className={styles.noResults}>
                  검색 결과가 없습니다. 다른 검색어를 시도해보세요.
                </div>
              ) : (
                <div className={styles.resultsList}>
                  {foreignStockSearch.results.stocks.map((stock, index) => (
                    <div
                      key={`${stock.symbol}-${index}`}
                      className={styles.resultItem}
                      onClick={() => handleStockSelect(stock)}
                    >
                      {/* 종목 메인 정보 */}
                      <div className={styles.stockMainInfo}>
                        <div className={styles.stockName}>
                          <div className={styles.name}>{stock.description}</div>
                          <div className={styles.code}>{stock.symbol}</div>
                        </div>
                        {stock.englishName &&
                          stock.englishName !== stock.description && (
                            <div className={styles.englishName}>
                              {stock.englishName}
                            </div>
                          )}
                      </div>

                      {/* 종목 메타 정보 */}
                      <div className={styles.stockMetaInfo}>
                        <div className={styles.exchange}>
                          {stock.exchange} • {stock.currency}
                        </div>
                        <div className={styles.country}>{stock.country}</div>
                      </div>

                      {/* 가격 정보 */}
                      {stock.currentPrice > 0 && (
                        <div className={styles.priceInfo}>
                          <div className={styles.currentPrice}>
                            {formatCurrency(stock.currentPrice, stock.currency)}
                          </div>
                          {(stock.changeAmount !== 0 ||
                            stock.changeRate !== 0) && (
                            <div
                              className={`${styles.priceChange} ${
                                stock.changeSign === "2"
                                  ? styles.positive
                                  : stock.changeSign === "5"
                                  ? styles.negative
                                  : styles.neutral
                              }`}
                            >
                              <span className={styles.changeAmount}>
                                {stock.changeAmount > 0 ? "+" : ""}
                                {formatCurrency(
                                  stock.changeAmount,
                                  stock.currency
                                )}
                              </span>
                              <span className={styles.changeRate}>
                                ({stock.changeRate > 0 ? "+" : ""}
                                {stock.changeRate.toFixed(2)}%)
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 거래량 정보 */}
                      {stock.volume > 0 && (
                        <div className={styles.volumeInfo}>
                          거래량: {stock.volume.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default OverseasStockView;
