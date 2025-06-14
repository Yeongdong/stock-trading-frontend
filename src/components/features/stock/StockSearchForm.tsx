import React, { useState } from "react";
import { useStockSearch } from "@/hooks/stock/useStockSearch";
import { StockSearchRequest, StockSearchResponse } from "@/types/stock/search";
import styles from "./StockSearchForm.module.css";

interface StockSearchFormProps {
  onSearchResults?: (results: StockSearchResponse) => void;
}

const StockSearchForm: React.FC<StockSearchFormProps> = ({
  onSearchResults,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { searchStocks, isLoading } = useStockSearch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) return;

    const request: StockSearchRequest = {
      searchTerm: searchTerm.trim(),
      page: 1,
      pageSize: 20,
    };

    const response = await searchStocks(request);
    if (response && onSearchResults) onSearchResults(response);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.stockSearchForm}>
      <div className={styles.searchInputGroup}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="종목명 또는 종목코드를 입력하세요 (예: 삼성전자, 005930)"
          disabled={isLoading}
          className={styles.searchInput}
        />
        <button
          type="submit"
          disabled={isLoading || !searchTerm.trim()}
          className={styles.searchButton}
        >
          {isLoading ? "검색중..." : "검색"}
        </button>
      </div>
    </form>
  );
};

export default StockSearchForm;
