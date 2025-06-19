import { useState, useCallback, useRef } from "react";
import { stockService } from "@/services/api/stock/stockService";
import {
  StockSearchRequest,
  StockSearchResponse,
  StockSearchResult,
  StockSearchSummary,
} from "@/types/domains/stock/search";

export const useStockSearch = () => {
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [searchResponse, setSearchResponse] =
    useState<StockSearchResponse | null>(null);
  const [summary, setSummary] = useState<StockSearchSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const searchStocks = useCallback(
    async (request: StockSearchRequest, isLoadMore = false) => {
      if (abortControllerRef.current) abortControllerRef.current.abort();

      abortControllerRef.current = new AbortController();
      setIsLoading(true);

      try {
        const response = await stockService.searchStocks(request);

        if (response) {
          const searchData = response;

          if (isLoadMore) {
            // 추가 로드 시 기존 결과에 추가
            setResults((prev) => [...prev, ...searchData.results]);
          } else {
            // 새 검색 시 결과 대체
            setResults(searchData.results);
            setLastSearchTerm(request.searchTerm);
          }

          setSearchResponse(searchData);
          setHasSearched(true);
          return searchData;
        }

        return null;
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  const loadMore = useCallback(async () => {
    if (!searchResponse?.hasMore || isLoading || !lastSearchTerm) return;

    const nextPage = (searchResponse.page || 1) + 1;
    await searchStocks(
      {
        searchTerm: lastSearchTerm,
        page: nextPage,
        pageSize: searchResponse.pageSize || 20,
      },
      true
    );
  }, [searchResponse, isLoading, lastSearchTerm, searchStocks]);

  const getStockByCode = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const result = await stockService.getStockByCode(code);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSearchSummary = useCallback(async () => {
    try {
      const summaryData = await stockService.getSearchSummary();
      setSummary(summaryData);
      return summaryData;
    } catch {
      return null;
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setSearchResponse(null);
    setHasSearched(false);
    setLastSearchTerm("");

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    results,
    searchResponse,
    summary,
    isLoading,
    hasSearched,
    searchStocks,
    loadMore,
    getStockByCode,
    getSearchSummary,
    clearResults,
  };
};
