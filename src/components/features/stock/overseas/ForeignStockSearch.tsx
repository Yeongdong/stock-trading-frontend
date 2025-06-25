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
  const [exchange, setExchange] = useState("");

  const { results, isLoading, error, searchStocks, clearResults } =
    useForeignStockSearch();

  const handleStockClick = (stock: ForeignStockInfo) => {
    onStockSelect?.(stock);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    searchStocks({
      query,
      exchange: exchange || undefined,
      limit: 50,
    });
  };

  return (
    <div className={styles.foreignStockSearch}>
      <h2>종목 검색</h2>

      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.inputGroup}>
          <select
            value={exchange}
            onChange={(e) => setExchange(e.target.value)}
            className={styles.exchangeSelect}
            disabled={isLoading}
          >
            <option value="">모든 거래소</option>
            <option value="NYSE">NYSE</option>
            <option value="NASDAQ">NASDAQ</option>
            <option value="LSE">LSE</option>
            <option value="TSE">TSE</option>
            <option value="HKEX">HKEX</option>
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
            <div className={styles.empty}>검색 결과가 없습니다.</div>
          ) : (
            <div className={styles.results}>
              <div className={styles.resultsHeader}>
                <h3>검색 결과 ({results.count.toLocaleString()}개)</h3>
                <button
                  type="button"
                  onClick={clearResults}
                  className={styles.clearButton}
                  disabled={isLoading}
                >
                  결과 지우기
                </button>
              </div>

              <div className={styles.stockGrid}>
                {results.stocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className={`${styles.stockCard} ${
                      onStockSelect ? styles.clickable : ""
                    }`}
                    onClick={() => handleStockClick(stock)}
                  >
                    <div className={styles.stockMainInfo}>
                      <div className={styles.stockName}>
                        <div className={styles.name}>{stock.description}</div>
                        <div className={styles.code}>{stock.symbol}</div>
                      </div>
                    </div>

                    <div className={styles.stockMetaInfo}>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>거래소</span>
                        <span className={styles.metaValue}>
                          {stock.exchange}
                        </span>
                      </div>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>통화</span>
                        <span className={styles.metaValue}>
                          {stock.currency}
                        </span>
                      </div>
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>국가</span>
                        <span className={styles.metaValue}>
                          {stock.country}
                        </span>
                      </div>
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
