import { useCallback } from "react";
import { useOverseasCurrentPrice } from "./useOverseasCurrentPrice";
import { useOverseasStockSearch } from "./useOverseasStockSearch";
import { OverseasMarket } from "@/types/domains/stock/overseas";

/**
 * 해외 주식 통합 관리 훅
 * 현재가 조회와 검색 기능을 모두 제공
 */
export const useOverseasStock = () => {
  const currentPriceHook = useOverseasCurrentPrice();
  const searchHook = useOverseasStockSearch();

  // 특정 종목의 현재가 조회
  const fetchStockPrice = useCallback(
    (stockCode: string, market: OverseasMarket) => {
      return currentPriceHook.fetchCurrentPrice({ stockCode, market });
    },
    [currentPriceHook]
  );

  // 시장별 주식 목록 조회
  const fetchMarketStocks = useCallback(
    (market: OverseasMarket) => {
      return searchHook.searchStocks({ market });
    },
    [searchHook]
  );

  // 모든 데이터 초기화
  const clearAllData = useCallback(() => {
    currentPriceHook.clearData();
    searchHook.clearResults();
  }, [currentPriceHook, searchHook]);

  return {
    // 현재가 관련
    currentPrice: {
      data: currentPriceHook.stockData,
      isLoading: currentPriceHook.isLoading,
      error: currentPriceHook.error,
      fetch: fetchStockPrice,
      clear: currentPriceHook.clearData,
    },

    // 검색 관련
    search: {
      results: searchHook.searchResults,
      isLoading: searchHook.isLoading,
      error: searchHook.error,
      totalCount: searchHook.totalCount,
      hasMore: searchHook.hasMore,
      fetch: fetchMarketStocks,
      clear: searchHook.clearResults,
    },

    // 공통
    clearAll: clearAllData,
    isAnyLoading: currentPriceHook.isLoading || searchHook.isLoading,
    hasAnyError: !!(currentPriceHook.error || searchHook.error),
  };
};
