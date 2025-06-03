import React, { useState, useEffect } from "react";
import StockSearchForm from "./StockSearchForm";
import StockSearchResults from "./StockSearchResults";
import { useStockSearch } from "@/hooks/stock/useStockSearch";
import { StockSearchResult, StockSearchResponse } from "@/types/stock/search";

const StockSearchView: React.FC = () => {
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { summary, getSearchSummary } = useStockSearch();

  useEffect(() => {
    getSearchSummary();
  }, [getSearchSummary]);

  const handleSearchResults = (response: StockSearchResponse) => {
    setSearchResults(response.results);
    setIsSearching(false);
  };

  const handleStockSelect = (stock: StockSearchResult) => {
    console.log("선택된 종목:", stock);
    // 여기에 종목 선택 시 동작 구현 (예: 상세 페이지 이동, 주문 폼으로 이동 등)
  };

  return (
    <div className="stock-search-view">
      <div className="search-header">
        <h2>주식 종목 검색</h2>
        {summary && (
          <div className="search-summary">
            <span>
              전체 {summary.totalStocks?.toLocaleString() || 0}개 종목
            </span>
            <span>KOSPI: {summary.kospiCount?.toLocaleString() || 0}</span>
            <span>KOSDAQ: {summary.kosdaqCount?.toLocaleString() || 0}</span>
            <span>KONEX: {summary.konexCount?.toLocaleString() || 0}</span>
          </div>
        )}
      </div>

      <StockSearchForm onSearchResults={handleSearchResults} />

      <StockSearchResults
        results={searchResults}
        isLoading={isSearching}
        onStockSelect={handleStockSelect}
      />
    </div>
  );
};

export default StockSearchView;
