import { useState, useCallback, useRef } from "react";
import { useError } from "@/contexts/ErrorContext";
import {
  StockSearchRequest,
  StockSearchResponse,
  StockSearchResult,
  StockSearchSummary,
} from "@/types/domains/stock/search";
import { stockService } from "@/services/api/stock/stockService";

export const useStockSearch = () => {
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [searchResponse, setSearchResponse] =
    useState<StockSearchResponse | null>(null);
  const [summary, setSummary] = useState<StockSearchSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState("");
  const { addError } = useError();
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchStocks = useCallback(
    async (request: StockSearchRequest, append = false) => {
      try {
        // 이전 요청 취소
        if (abortControllerRef.current) abortControllerRef.current.abort();

        abortControllerRef.current = new AbortController();
        setIsLoading(true);

        // 새로운 검색이면 검색어 저장
        if (!append) setLastSearchTerm(request.searchTerm);

        const response = await stockService.searchStocks(request);

        if (append && searchResponse) {
          // 더보기 - 기존 결과에 추가
          const updatedResults = [...results, ...response.results];
          setResults(updatedResults);
          setSearchResponse({
            ...response,
            results: updatedResults,
            page: response.page,
          });
        } else {
          // 새로운 검색
          setResults(response.results);
          setSearchResponse(response);
          setHasSearched(true);
        }

        return response;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return null; // 취소된 요청은 무시

        const errorMessage =
          err instanceof Error
            ? err.message
            : "주식 검색 중 오류가 발생했습니다.";

        addError({
          message: errorMessage,
          severity: "error",
        });
        return null;
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [addError, results, searchResponse]
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

  const getStockByCode = useCallback(
    async (code: string) => {
      try {
        setIsLoading(true);

        const result = await stockService.getStockByCode(code);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "종목 조회 중 오류가 발생했습니다.";

        addError({
          message: errorMessage,
          severity: "error",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [addError]
  );

  const getSearchSummary = useCallback(async () => {
    try {
      const summaryData = await stockService.getSearchSummary();
      setSummary(summaryData);
      return summaryData;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "요약 정보 조회 중 오류가 발생했습니다.";

      addError({
        message: errorMessage,
        severity: "error",
      });
      return null;
    }
  }, [addError]);

  const clearResults = useCallback(() => {
    setResults([]);
    setSearchResponse(null);
    setHasSearched(false);
    setLastSearchTerm("");
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
