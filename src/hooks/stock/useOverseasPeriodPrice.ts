import { useCallback, useState } from "react";
import { stockService } from "@/services/api/stock/stockService";
import {
  OverseasPeriodPriceRequest,
  OverseasPeriodPriceResponse,
} from "@/types/domains/stock/overseas";

export const useOverseasPeriodPrice = () => {
  const [data, setData] = useState<OverseasPeriodPriceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverseasPeriodPrice = useCallback(
    async (request: OverseasPeriodPriceRequest) => {
      if (!request.stockCode?.trim()) {
        setError("종목코드: 필수 입력 항목입니다");
        return;
      }

      setLoading(true);
      setError(null);

      const response = await stockService.getOverseasPeriodPrice(request);

      if (response.error) {
        setError(response.error);
        setData(null);
      } else {
        setData(response.data || null);
      }

      setLoading(false);
    },
    []
  );

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchOverseasPeriodPrice,
    clearData,
  };
};
