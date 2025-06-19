import React from "react";
import { useStockSearch } from "@/hooks/stock/useStockSearch";

import styles from "./StockSearchResults.module.css";
import { StockSearchResultsProps } from "@/types";

const StockSearchResults: React.FC<StockSearchResultsProps> = ({
  onStockSelect,
}) => {
  const { results, searchResponse, isLoading, hasSearched, loadMore } =
    useStockSearch();

  if (isLoading && results.length === 0)
    return (
      <div className={`${styles.searchResults} ${styles.loading}`}>
        <p>검색 중...</p>
      </div>
    );

  if (!hasSearched) return null;

  if (results.length === 0)
    return (
      <div className={`${styles.searchResults} ${styles.empty}`}>
        <p>검색 결과가 없습니다.</p>
      </div>
    );

  const handleLoadMore = async () => {
    await loadMore();
  };

  return (
    <div className={styles.searchResults}>
      <div className={styles.resultsHeader}>
        <h3>
          검색 결과 (
          {searchResponse?.totalCount?.toLocaleString() || results.length}건)
        </h3>
      </div>

      <div className={styles.resultsList}>
        {results.map((stock) => (
          <div
            key={stock.code}
            className={`${styles.resultItem} ${styles.clickable}`}
            onClick={() => onStockSelect(stock)}
          >
            <div className={styles.stockMainInfo}>
              <div className={styles.stockName}>
                <span className={styles.name}>{stock.name}</span>
                <span className={styles.code}>({stock.code})</span>
              </div>
              {stock.englishName && (
                <div className={styles.englishName}>{stock.englishName}</div>
              )}
            </div>

            <div className={styles.stockMetaInfo}>
              <span>{stock.market}</span>
              <span>{stock.sector}</span>
            </div>
          </div>
        ))}
      </div>

      {searchResponse?.hasMore && (
        <div className={styles.loadMoreSection}>
          <button
            className={styles.loadMoreButton}
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "로딩중..." : "더보기"}
          </button>
        </div>
      )}
    </div>
  );
};

export default StockSearchResults;
