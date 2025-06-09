import { useState, useCallback } from "react";
import {
  PeriodPriceRequest,
  PeriodPriceResponse,
} from "../../types/stock/price";
import { stockService } from "@/services/api";

export const usePeriodPrice = () => {
  const [data, setData] = useState<PeriodPriceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriodPrice = useCallback(async (request: PeriodPriceRequest) => {
    console.log("fetchPeriodPrice called with:", request); // 추가
    setLoading(true);
    setError(null);

    try {
      const response = await stockService.getPeriodPrice(request);
      console.log("API Response:", response);
      console.log("Response.data:", response.data);

      setData(response.data || null);
      console.log("Data set successfully:", response.data); // 이 로그 추가
    } catch (err) {
      console.error("API Error:", err); // 추가

      const errorMessage =
        err instanceof Error ? err.message : "기간별 시세 조회에 실패했습니다.";
      setError(errorMessage);
      console.error("Period price fetch error:", err);
    } finally {
      setLoading(false);
      console.log("Loading set to false"); // 이 로그도 추가
    }
  }, []);

  const clearData = useCallback(() => {
    console.log("clearData called");
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    fetchPeriodPrice,
    clearData,
  };
};
