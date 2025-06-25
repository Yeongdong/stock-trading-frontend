import React from "react";
import {
  UseOverseasStockSearchResult,
  OverseasStockSearchResult,
} from "@/types/domains/stock/overseas";
import styles from "./OverseasStockResults.module.css";

interface OverseasStockResultsProps {
  searchHook: UseOverseasStockSearchResult;
  onStockSelect?: (stock: {
    code: string;
    name: string;
    market: string;
  }) => void;
}

const OverseasStockResults: React.FC<OverseasStockResultsProps> = ({
  searchHook,
  onStockSelect,
}) => {
  const { searchResults, isLoading, error, totalCount } = searchHook;

  const handleStockClick = (stock: OverseasStockSearchResult) => {
    onStockSelect?.({
      code: stock.code,
      name: stock.name,
      market: stock.market,
    });
  };

  if (isLoading) {
    return <div className={styles.loading}>검색 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!searchResults || searchResults.length === 0) {
    return <div className={styles.empty}>검색 결과가 없습니다.</div>;
  }

  return (
    <div className={styles.overseasStockResults}>
      <div className={styles.resultsHeader}>
        <h3>검색 결과 ({totalCount.toLocaleString()}개)</h3>
      </div>

      <div className={styles.resultsList}>
        {searchResults.map((stock) => (
          <div
            key={`${stock.market}-${stock.code}`}
            className={`${styles.resultItem} ${
              onStockSelect ? styles.clickable : ""
            }`}
            onClick={() => handleStockClick(stock)}
          >
            <div className={styles.stockMainInfo}>
              <div className={styles.stockName}>
                <div className={styles.name}>{stock.name}</div>
                <div className={styles.code}>{stock.code}</div>
              </div>
            </div>

            <div className={styles.stockMetaInfo}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>시장</span>
                <span className={styles.metaValue}>
                  {stock.market.toUpperCase()}
                </span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>통화</span>
                <span className={styles.metaValue}>{stock.currency}</span>
              </div>
              {stock.sector && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>섹터</span>
                  <span className={styles.metaValue}>{stock.sector}</span>
                </div>
              )}
            </div>

            {stock.currentPrice && (
              <div className={styles.priceInfo}>
                <div className={styles.currentPrice}>
                  {stock.currentPrice.toLocaleString()} {stock.currency}
                </div>
                {stock.priceChange && stock.changeRate && (
                  <div
                    className={`${styles.priceChange} ${
                      stock.priceChange > 0
                        ? styles.positive
                        : stock.priceChange < 0
                        ? styles.negative
                        : styles.neutral
                    }`}
                  >
                    {stock.priceChange > 0 ? "+" : ""}
                    {stock.priceChange.toFixed(2)}(
                    {stock.changeRate > 0 ? "+" : ""}
                    {stock.changeRate.toFixed(2)}%)
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverseasStockResults;
