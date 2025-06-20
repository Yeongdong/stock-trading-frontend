import React, { useState, useCallback, useEffect } from "react";
import useDebounce from "@/hooks/common/useDebounce";
import { StockSearchRequest } from "@/types/domains/stock/search";
import { StockSearchFormProps } from "@/types/domains/stock/components";
import styles from "./StockSearchForm.module.css";

const MIN_SEARCH_LENGTH = 1;
const DEBOUNCE_DELAY = 300;

const StockSearchForm: React.FC<StockSearchFormProps> = ({
  stockSearchHook,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);
  const { searchStocks, isLoading, clearResults } = stockSearchHook;

  const handleSearch = useCallback(
    async (term: string) => {
      if (!term || term.trim().length < MIN_SEARCH_LENGTH) {
        clearResults();
        return;
      }

      const request: StockSearchRequest = {
        searchTerm: term.trim(),
        page: 1,
        pageSize: 20,
      };

      await searchStocks(request);
    },
    [searchStocks, clearResults]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSearch(searchTerm);
  };

  // 디바운싱된 검색어로 자동 검색
  useEffect(() => {
    handleSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, handleSearch]);

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
          autoComplete="off"
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
