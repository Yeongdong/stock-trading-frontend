import { useCallback, useState } from "react";
import {
  CurrentPriceRequest,
  CurrentPriceResponse,
} from "@/types/domains/stock/price";
import { stockService } from "@/services/api/stock/stockService";

/**
 * 현재가 조회 훅
 */
export const useCurrentPrice = () => {
  const [data, setData] = useState<CurrentPriceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentPrice = useCallback(async (request: CurrentPriceRequest) => {
    setIsLoading(true);

    try {
      const response = await stockService.getCurrentPrice(request);

      if (response.data && !response.error) {
        setData(response.data);
        return response;
      }

      // 실패 시 null 설정
      setData(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  return {
    data,
    isLoading,
    getCurrentPrice,
    clearData,
  };
};
