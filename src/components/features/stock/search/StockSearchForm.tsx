import React, { useState, useCallback, useEffect, useRef } from "react";
import useDebounce from "@/hooks/common/useDebounce";
import { useStockAutocomplete } from "@/hooks/stock/useStockAutocomplete";
import { StockSearchRequest } from "@/types/domains/stock/search";
import { StockSearchFormProps } from "@/types/domains/stock/components";
import { StockSearchResult } from "@/types/domains/stock/search";
import styles from "./StockSearchForm.module.css";

const MIN_SEARCH_LENGTH = 1;
const DEBOUNCE_DELAY = 300;

const StockSearchForm: React.FC<StockSearchFormProps> = ({
  stockSearchHook,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);
  const { searchStocks, isLoading, clearResults } = stockSearchHook;

  const {
    suggestions,
    isLoading: isAutocompleteLoading,
    error: autocompleteError,
    fetchSuggestions,
    clearSuggestions,
    prewarmCache,
  } = useStockAutocomplete({
    memoryMaxSize: 50,
    storageMaxSize: 200,
    ttl: 10 * 60 * 1000, // 10분
    version: "1.0.0",
    storagePrefix: "stock_search_",
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsId = "stock-search-suggestions";

  // debounced term으로 자동완성 후보 검색 (캐싱됨)
  useEffect(() => {
    if (
      debouncedSearchTerm &&
      showSuggestions &&
      debouncedSearchTerm.length >= MIN_SEARCH_LENGTH
    ) {
      fetchSuggestions({
        searchTerm: debouncedSearchTerm,
        page: 1,
        pageSize: 10,
      });
    } else {
      clearSuggestions();
    }
  }, [
    debouncedSearchTerm,
    showSuggestions,
    fetchSuggestions,
    clearSuggestions,
  ]);

  // 캐시 프리워밍 (컴포넌트 마운트 시 인기 종목들 미리 캐시)
  useEffect(() => {
    const popularStocks = [
      "삼성전자",
      "SK하이닉스",
      "LG에너지솔루션",
      "NAVER",
      "카카오",
    ];
    prewarmCache(popularStocks);
  }, [prewarmCache]);

  // 검색 실행
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

      setShowSuggestions(false);
      await searchStocks(request);
    },
    [searchStocks, clearResults]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSearch(searchTerm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch(searchTerm);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleSearch(searchTerm);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionSelect = (suggestion: StockSearchResult) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // 선택된 종목으로 즉시 검색 실행
    handleSearch(suggestion.code);
  };

  const handleInputBlur = () => {
    // 약간의 지연을 두어 클릭 이벤트가 처리되도록 함
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleInputFocus = () => {
    if (searchTerm && suggestions.length > 0) setShowSuggestions(true);
  };

  const handleClearInput = () => {
    setSearchTerm("");
    setShowSuggestions(false);
    setSelectedIndex(-1);
    clearSuggestions();
    clearResults();
    inputRef.current?.focus();
  };

  const isSearchDisabled = isLoading || !searchTerm.trim();
  const showClearButton = searchTerm.length > 0;
  const showLoadingInSuggestions = isAutocompleteLoading && showSuggestions;

  return (
    <div ref={containerRef} className={styles.stockSearchFormContainer}>
      <form onSubmit={handleSubmit} className={styles.stockSearchForm}>
        <div className={styles.searchInputGroup}>
          <div className={styles.inputContainer}>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleInputBlur}
              onFocus={handleInputFocus}
              placeholder="종목명 또는 종목코드를 입력하세요 (예: 삼성전자, 005930)"
              disabled={isLoading}
              className={styles.searchInput}
              autoComplete="off"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              aria-controls={suggestionsId}
              aria-describedby={autocompleteError ? "search-error" : undefined}
            />

            {showClearButton && (
              <button
                type="button"
                onClick={handleClearInput}
                className={styles.clearButton}
                aria-label="검색어 지우기"
              >
                ✕
              </button>
            )}

            {showSuggestions && (
              <div
                id={suggestionsId}
                className={styles.suggestions}
                role="listbox"
              >
                {showLoadingInSuggestions && (
                  <div className={styles.suggestionLoading}>검색 중...</div>
                )}

                {!showLoadingInSuggestions &&
                  suggestions.length > 0 &&
                  suggestions.map((suggestion, index) => (
                    <div
                      key={`${suggestion.code}-${index}`}
                      className={`${styles.suggestionItem} ${
                        index === selectedIndex ? styles.selected : ""
                      }`}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      role="option"
                      aria-selected={index === selectedIndex}
                    >
                      <div className={styles.suggestionMain}>
                        <span className={styles.suggestionName}>
                          {suggestion.name}
                        </span>
                        <span className={styles.suggestionCode}>
                          {suggestion.code}
                        </span>
                      </div>
                      <div className={styles.suggestionMarket}>
                        {suggestion.market}
                      </div>
                    </div>
                  ))}

                {!showLoadingInSuggestions &&
                  suggestions.length === 0 &&
                  debouncedSearchTerm && (
                    <div className={styles.suggestionEmpty}>
                      검색 결과가 없습니다
                    </div>
                  )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSearchDisabled}
            className={styles.searchButton}
          >
            {isLoading ? (
              <span className={styles.buttonLoading}>검색중...</span>
            ) : (
              <span>검색</span>
            )}
          </button>
        </div>
      </form>

      {autocompleteError && (
        <div id="search-error" className={styles.errorMessage}>
          {autocompleteError}
        </div>
      )}
    </div>
  );
};

export default StockSearchForm;
