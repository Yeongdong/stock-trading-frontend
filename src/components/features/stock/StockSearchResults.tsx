import React from "react";
import { StockSearchResult } from "@/types/stock/search";

interface StockSearchResultsProps {
  results: StockSearchResult[];
  isLoading: boolean;
  onStockSelect?: (stock: StockSearchResult) => void;
}

const StockSearchResults: React.FC<StockSearchResultsProps> = ({
  results,
  isLoading,
  onStockSelect,
}) => {
  if (isLoading) {
    return (
      <div className="search-results loading">
        <p>검색 중...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-results empty">
        <p>검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="results-header">
        <h3>검색 결과 ({results.length}건)</h3>
      </div>

      <div className="results-list">
        {results.map((stock) => (
          <div
            key={stock.code}
            className="result-item"
            onClick={() => onStockSelect?.(stock)}
            style={{ cursor: onStockSelect ? "pointer" : "default" }}
          >
            <div className="stock-main-info">
              <div className="stock-name">
                <span className="name">{stock.name}</span>
                <span className="code">({stock.code})</span>
              </div>
              {stock.englishName && (
                <div className="english-name">{stock.englishName}</div>
              )}
            </div>

            <div className="stock-meta-info">
              <span className="market">{stock.market}</span>
              <span className="sector">{stock.sector}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockSearchResults;
