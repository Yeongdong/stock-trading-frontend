import { useState, useCallback, useRef } from "react";
import { stockService } from "@/services/api/stock/stockService";
import {
  StockSearchRequest,
  StockSearchResponse,
  StockSearchResult,
  StockSearchSummary,
} from "@/types/domains/stock/search";
import { UseStockSearchResult } from "@/types/domains/stock/hooks";

/**
 * 주식 검색 훅
 */
export const useStockSearch = (): UseStockSearchResult => {
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [searchResponse, setSearchResponse] =
    useState<StockSearchResponse | null>(null);
  const [summary, setSummary] = useState<StockSearchSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);

  // 주식 검색
  const searchStocks = useCallback(
    async (
      request: StockSearchRequest,
      isLoadMore = false
    ): Promise<StockSearchResponse | null> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);

      try {
        const response = await stockService.searchStocks(request);

        if (response.data && !response.error) {
          const searchData = response.data;

          if (isLoadMore) {
            setResults((prev) => [...prev, ...searchData.results]);
          } else {
            setResults(searchData.results);
            setLastSearchTerm(request.searchTerm);
          }

          setSearchResponse(searchData);
          setHasSearched(true);
          return searchData;
        }

        if (!isLoadMore) {
          setResults([]);
          setSearchResponse(null);
          setHasSearched(true);
        }

        return null;
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    []
  );

  // 더보기
  const loadMore = useCallback(async (): Promise<void> => {
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

  // 종목 코드로 조회
  const getStockByCode = useCallback(
    async (code: string): Promise<StockSearchResult | null> => {
      setIsLoading(true);

      try {
        const response = await stockService.getStockByCode(code);

        if (response.data && !response.error) return response.data;

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 검색 요약 정보 조회
  const getSearchSummary =
    useCallback(async (): Promise<StockSearchSummary | null> => {
      const response = await stockService.getSearchSummary();

      if (response.data && !response.error) {
        setSummary(response.data);
        return response.data;
      }

      return null;
    }, []);

  // 결과 초기화
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
