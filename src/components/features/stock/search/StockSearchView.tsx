import React, { useState, useEffect } from "react";
import StockSearchForm from "./StockSearchForm";
import StockSearchResults from "./StockSearchResults";
import { useStockSearch } from "@/hooks/stock/useStockSearch";
import {
  StockSearchResult,
  StockSearchResponse,
} from "@/types/domains/stock/search";
import styles from "./StockSearchView.module.css";

interface StockSearchViewProps {
  onStockSelect?: (stock: StockSearchResult) => void;
}

const StockSearchView: React.FC<StockSearchViewProps> = ({ onStockSelect }) => {
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { summary, getSearchSummary } = useStockSearch();

  useEffect(() => {
    getSearchSummary();
  }, [getSearchSummary]);

  const handleSearchResults = (response: StockSearchResponse) => {
    setSearchResults(response.results);
    setIsSearching(false);
    setHasSearched(true);
  };

  const handleStockSelect = (stock: StockSearchResult) => {
    onStockSelect?.(stock);
  };

  return (
    <div className={styles.stockSearchView}>
      <div className={styles.searchHeader}>
        <h2>주식 종목 검색</h2>
        {summary && (
          <div className={styles.searchSummary}>
            <span>
              전체 {summary.totalStocks?.toLocaleString() || 0}개 종목
            </span>
            <span>KOSPI: {summary.kospiCount?.toLocaleString() || 0}</span>
            <span>KOSDAQ: {summary.kosdaqCount?.toLocaleString() || 0}</span>
            <span>KONEX: {summary.konexCount?.toLocaleString() || 0}</span>
          </div>
        )}
      </div>

      <div className={styles.searchContent}>
        <StockSearchForm onSearchResults={handleSearchResults} />

        <StockSearchResults
          results={searchResults}
          isLoading={isSearching}
          onStockSelect={handleStockSelect}
          hasSearched={hasSearched}
        />
      </div>
    </div>
  );
};

export default StockSearchView;
