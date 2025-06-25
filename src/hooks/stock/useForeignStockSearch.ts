import { useState } from "react";
import { stockService } from "@/services/api/stock/stockService";
import {
  ForeignStockSearchRequest,
  ForeignStockSearchResult,
} from "@/types/domains/stock/foreignStock";

export const useForeignStockSearch = () => {
  const [results, setResults] = useState<ForeignStockSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchStocks = async (request: ForeignStockSearchRequest) => {
    if (!request.query.trim()) {
      setError("검색어를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await stockService.searchForeignStocks({
      ...request,
      query: request.query.trim(),
    });

    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setResults(response.data);
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return {
    results,
    isLoading,
    error,
    searchStocks,
    clearResults,
  };
};
