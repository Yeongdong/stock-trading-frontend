import React, { useState, useMemo } from "react";
import { StockSearchResult } from "@/types/stock/search";
import styles from "./StockSearchResults.module.css";

interface StockSearchResultsProps {
  results: StockSearchResult[];
  isLoading: boolean;
  onStockSelect?: (stock: StockSearchResult) => void;
  hasSearched?: boolean;
}

const StockSearchResults: React.FC<StockSearchResultsProps> = ({
  results,
  isLoading,
  onStockSelect,
  hasSearched = false,
}) => {
  const [showAll, setShowAll] = useState(false);

  // 2줄(8개)까지만 보여주고 나머지는 더보기로 처리
  const ITEMS_PER_ROW = 4;
  const INITIAL_ROWS = 2;
  const INITIAL_SHOW_COUNT = ITEMS_PER_ROW * INITIAL_ROWS;

  const { displayResults, hasMore } = useMemo(() => {
    const shouldShowMore = results.length > INITIAL_SHOW_COUNT;
    const display = showAll ? results : results.slice(0, INITIAL_SHOW_COUNT);

    return {
      displayResults: display,
      hasMore: shouldShowMore && !showAll,
    };
  }, [results, showAll, INITIAL_SHOW_COUNT]);

  if (isLoading)
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

  const handleShowMore = () => {
    setShowAll(true);
  };

  return (
    <div className={styles.searchResults}>
      <div className={styles.resultsHeader}>
        <h3>검색 결과 ({results.length}건)</h3>
      </div>

      <div className={styles.resultsList}>
        {displayResults.map((stock) => (
          <div
            key={stock.code}
            className={`${styles.resultItem} ${
              onStockSelect ? styles.clickable : ""
            }`}
            onClick={() => onStockSelect?.(stock)}
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

      {hasMore && (
        <div className={styles.showMoreSection}>
          <button className={styles.showMoreButton} onClick={handleShowMore}>
            더보기 ({results.length - INITIAL_SHOW_COUNT}개 더)
          </button>
        </div>
      )}
    </div>
  );
};

export default StockSearchResults;
