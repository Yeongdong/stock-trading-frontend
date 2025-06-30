import React, { useState } from "react";
import { useForeignStockSearch } from "@/hooks/stock/useForeignStockSearch";
import { ForeignStockInfo } from "@/types/domains/stock/foreignStock";
import styles from "./ForeignStockSearch.module.css";

interface ForeignStockSearchProps {
  onStockSelect?: (stock: ForeignStockInfo) => void;
}

const ForeignStockSearch: React.FC<ForeignStockSearchProps> = ({
  onStockSelect,
}) => {
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState("nasdaq");

  const { results, isLoading, error, searchStocks, clearResults } =
    useForeignStockSearch();

  const handleStockClick = (stock: ForeignStockInfo) => {
    onStockSelect?.(stock);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    searchStocks({
      market,
      query: query.trim(),
      limit: 50,
    });
  };

  return (
    <div className={styles.foreignStockSearch}>
      <h2>종목 검색</h2>

      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.inputGroup}>
          <select
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            className={styles.exchangeSelect}
            disabled={isLoading}
          >
            <option value="nasdaq">나스닥 (NASDAQ)</option>
            <option value="nyse">뉴욕증권거래소 (NYSE)</option>
            <option value="tokyo">도쿄증권거래소 (TSE)</option>
            <option value="hongkong">홍콩증권거래소 (HKS)</option>
          </select>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="종목명 또는 심볼을 입력하세요 (예: Apple, AAPL)"
            className={styles.searchInput}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={styles.searchButton}
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? "검색 중..." : "검색"}
          </button>
        </div>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {/* 검색 결과를 그리드 형태로 표시 */}
      {results && (
        <>
          {isLoading ? (
            <div className={styles.loading}>검색 중...</div>
          ) : results.stocks.length === 0 ? (
            <div className={styles.noResults}>
              검색 결과가 없습니다. 다른 검색어를 시도해보세요.
            </div>
          ) : (
            <div className={styles.resultsContainer}>
              <div className={styles.resultsHeader}>
                <h3>검색 결과 ({results.count}개)</h3>
                <button onClick={clearResults} className={styles.clearButton}>
                  초기화
                </button>
              </div>

              <div className={styles.resultsList}>
                {results.stocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className={styles.resultItem}
                    onClick={() => handleStockClick(stock)}
                  >
                    <div className={styles.stockHeader}>
                      <div className={styles.stockSymbol}>{stock.symbol}</div>
                      <div className={styles.stockExchange}>
                        {stock.exchange}
                      </div>
                    </div>

                    <div className={styles.stockNames}>
                      <div className={styles.stockName}>
                        {stock.description}
                      </div>
                      {stock.englishName &&
                        stock.englishName !== stock.description && (
                          <div className={styles.stockEnglishName}>
                            {stock.englishName}
                          </div>
                        )}
                    </div>

                    <div className={styles.stockDetails}>
                      <div className={styles.stockCountry}>
                        {stock.country} • {stock.currency}
                      </div>
                      {stock.currentPrice > 0 && (
                        <div className={styles.stockPrice}>
                          {new Intl.NumberFormat("ko-KR", {
                            style: "currency",
                            currency: stock.currency,
                            minimumFractionDigits: 2,
                          }).format(stock.currentPrice)}
                          {stock.changeRate !== 0 && (
                            <span
                              className={`${styles.priceChange} ${
                                stock.changeSign === "2" ||
                                stock.changeSign === "1"
                                  ? styles.positive
                                  : stock.changeSign === "5" ||
                                    stock.changeSign === "4"
                                  ? styles.negative
                                  : styles.neutral
                              }`}
                            >
                              ({stock.changeRate > 0 ? "+" : ""}
                              {stock.changeRate.toFixed(2)}%)
                            </span>
                          )}
                        </div>
                      )}
                      {stock.isTradable && (
                        <div className={styles.tradable}>매매가능</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ForeignStockSearch;
