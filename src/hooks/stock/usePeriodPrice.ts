import { useState } from "react";
import {
  PeriodPriceRequest,
  PeriodPriceResponse,
} from "../../types/stock/price";
import { stockService } from "@/services/api";

export const usePeriodPrice = () => {
  const [data, setData] = useState<PeriodPriceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriodPrice = async (request: PeriodPriceRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await stockService.getPeriodPrice(request);
      setData(response.data || null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "기간별 시세 조회에 실패했습니다.";
      setError(errorMessage);
      console.error("Period price fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setData(null);
    setError(null);
  };

  return {
    data,
    loading,
    error,
    fetchPeriodPrice,
    clearData,
  };
};
