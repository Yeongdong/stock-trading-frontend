import { useCallback, useState } from "react";
import {
  OverseasCurrentPriceRequest,
  OverseasCurrentPriceResponse,
  UseOverseasStockResult,
} from "@/types/domains/stock/overseas";
import { stockService } from "@/services/api/stock/stockService";

/**
 * 해외 주식 현재가 조회 훅
 */
export const useOverseasCurrentPrice = (): UseOverseasStockResult => {
  const [stockData, setStockData] =
    useState<OverseasCurrentPriceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentPrice = useCallback(
    async (request: OverseasCurrentPriceRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await stockService.getOverseasCurrentPrice(request);

        if (response.data && !response.error) {
          setStockData(response.data);
        } else {
          setError(response.error || "해외 주식 현재가 조회에 실패했습니다.");
          setStockData(null);
        }
      } catch {
        setError("네트워크 오류가 발생했습니다.");
        setStockData(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearData = useCallback(() => {
    setStockData(null);
    setError(null);
  }, []);

  return {
    stockData,
    isLoading,
    error,
    fetchCurrentPrice,
    clearData,
  };
};
