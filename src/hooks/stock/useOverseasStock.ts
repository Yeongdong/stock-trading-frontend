import { useCallback } from "react";
import { useOverseasCurrentPrice } from "./useOverseasCurrentPrice";
import { OverseasMarket } from "@/types/domains/stock/overseas";

/**
 * 해외 주식 현재가 조회 훅
 * 개별 종목의 상세 현재가 정보 조회만 담당
 */
export const useOverseasStock = () => {
  const currentPriceHook = useOverseasCurrentPrice();

  // 특정 종목의 현재가 조회
  const fetchStockPrice = useCallback(
    (stockCode: string, market: OverseasMarket) => {
      return currentPriceHook.fetchCurrentPrice({ stockCode, market });
    },
    [currentPriceHook]
  );

  // 데이터 초기화
  const clearData = useCallback(() => {
    currentPriceHook.clearData();
  }, [currentPriceHook]);

  return {
    // 현재가 관련
    currentPrice: {
      data: currentPriceHook.stockData,
      isLoading: currentPriceHook.isLoading,
      error: currentPriceHook.error,
      fetch: fetchStockPrice,
      clear: currentPriceHook.clearData,
    },

    // 공통
    clearAll: clearData,
    isLoading: currentPriceHook.isLoading,
    hasError: !!currentPriceHook.error,
  };
};
