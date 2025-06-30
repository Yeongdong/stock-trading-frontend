import { useState, useCallback } from "react";
import { stockService } from "@/services/api/stock/stockService";
import {
  ForeignStockSearchRequest,
  ForeignStockSearchResult,
} from "@/types/domains/stock/foreignStock";

export const useForeignStockSearch = () => {
  const [results, setResults] = useState<ForeignStockSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchStocks = useCallback(
    async (request: ForeignStockSearchRequest) => {
      // 유효성 검사
      if (!request.market?.trim()) {
        setError("거래소 시장을 선택해주세요.");
        return;
      }

      if (!request.query?.trim()) {
        setError("검색어를 입력해주세요.");
        return;
      }

      setIsLoading(true);
      setError(null);

      const response = await stockService.searchForeignStocks({
        market: request.market.trim(),
        query: request.query.trim(),
        limit: request.limit || 50,
      });

      if (response.error) {
        setError(response.error);
        setResults(null);
      } else if (response.data) {
        setResults(response.data);
        setError(null);
      }

      setIsLoading(false);
    },
    []
  );

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    searchStocks,
    clearResults,
  };
};
