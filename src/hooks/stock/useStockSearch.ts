import { useState, useCallback } from "react";
import { useError } from "@/contexts/ErrorContext";

import {
  StockSearchRequest,
  StockSearchResult,
  StockSearchSummary,
} from "@/types/stock/search";
import { stockService } from "@/services/api/stock/stockService";

export const useStockSearch = () => {
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [summary, setSummary] = useState<StockSearchSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  const searchStocks = useCallback(
    async (request: StockSearchRequest) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await stockService.searchStocks(request);
        setResults(response.results);

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "주식 검색 중 오류가 발생했습니다.";

        setError(errorMessage);
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

  const getStockByCode = useCallback(
    async (code: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await stockService.getStockByCode(code);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "종목 조회 중 오류가 발생했습니다.";

        setError(errorMessage);
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
    setError(null);
  }, []);

  return {
    results,
    summary,
    isLoading,
    error,
    searchStocks,
    getStockByCode,
    getSearchSummary,
    clearResults,
  };
};
