import { useState, useCallback } from "react";
import {
  OverseasStockSearchRequest,
  OverseasStockSearchResult,
  UseOverseasStockSearchResult,
  OverseasMarket,
} from "@/types/domains/stock/overseas";
import { stockService } from "@/services/api/stock/stockService";

/**
 * 해외 주식 검색 훅
 */
export const useOverseasStockSearch = (): UseOverseasStockSearchResult => {
  const [searchResults, setSearchResults] = useState<
    OverseasStockSearchResult[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [, setCurrentMarket] = useState<OverseasMarket | null>(null);

  const searchStocks = useCallback(
    async (request: OverseasStockSearchRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await stockService.getOverseasStocksByMarket(request);

        if (response.data && !response.error) {
          const { market, stocks } = response.data;

          setSearchResults(stocks);
          setTotalCount(stocks.length);
          setHasMore(false);
          setCurrentMarket(market);
        } else {
          setError(response.error || "해외 주식 검색에 실패했습니다.");
          setSearchResults([]);
          setTotalCount(0);
          setHasMore(false);
        }
      } catch {
        setError("네트워크 오류가 발생했습니다.");
        setSearchResults([]);
        setTotalCount(0);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loadMore = useCallback(async () => {
    // 향후 백엔드에서 페이지네이션 지원 시 구현
    console.log("해외 주식 더보기 기능은 현재 지원되지 않습니다.");
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setTotalCount(0);
    setHasMore(false);
    setError(null);
    setCurrentMarket(null);
  }, []);

  return {
    searchResults,
    isLoading,
    error,
    totalCount,
    hasMore,
    searchStocks,
    loadMore,
    clearResults,
  };
};
