import React, { useState } from "react";
import { useForeignStockSearch } from "@/hooks/stock/useForeignStockSearch";
import styles from "./ForeignStockSearch.module.css";
import { ForeignStockInfo } from "@/types/domains/stock/foreignStock";

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
    searchStocks({
      query,
      exchange: exchange || undefined,
      limit: 50,
    });
  };

  return (
    <div className={styles.foreignStockSearch}>
      <h2>해외 주식 검색</h2>

      <form onSubmit={handleSubmit} className={styles.searchForm}>
        <div className={styles.formGroup}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="종목명 또는 심볼을 입력하세요 (예: Apple, AAPL)"
            className={styles.searchInput}
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
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
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="submit"
            className={styles.searchButton}
            disabled={isLoading}
          >
            {isLoading ? "검색 중..." : "검색"}
          </button>

          {results && (
            <button
              type="button"
              onClick={clearResults}
              className={styles.clearButton}
              disabled={isLoading}
            >
              결과 지우기
            </button>
          )}
        </div>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {results && (
        <div className={styles.results}>
          <h3>검색 결과 ({results.count}개)</h3>

          {results.stocks.length === 0 ? (
            <p className={styles.noResults}>검색 결과가 없습니다.</p>
          ) : (
            <div className={styles.stockList}>
              <div className={styles.stockList}>
                {" "}
                {results.stocks.map((stock) => (
                  <div
                    key={stock.symbol}
                    className={`${styles.stockItem} ${
                      onStockSelect ? styles.clickable : ""
                    }`}
                    onClick={() => handleStockClick(stock)}
                  >
                    {" "}
                    <div key={stock.symbol} className={styles.stockItem}>
                      <div className={styles.stockHeader}>
                        <span className={styles.symbol}>{stock.symbol}</span>
                        <span className={styles.exchange}>
                          {stock.exchange}
                        </span>
                      </div>
                      <div className={styles.stockInfo}>
                        <p className={styles.description}>
                          {stock.description}
                        </p>
                        <div className={styles.metadata}>
                          <span className={styles.type}>{stock.type}</span>
                          <span className={styles.currency}>
                            {stock.currency}
                          </span>
                          <span className={styles.country}>
                            {stock.country}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}{" "}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ForeignStockSearch;
