import { useCallback, useState } from "react";
import { useError } from "@/contexts/ErrorContext";
import { CurrentPriceRequest, CurrentPriceResponse } from "@/types/stock/price";
import { stockService } from "@/services/api/stock/stockService";

export const useCurrentPrice = () => {
  const [data, setData] = useState<CurrentPriceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  const getCurrentPrice = useCallback(
    async (request: CurrentPriceRequest) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await stockService.getCurrentPrice(request);
        setData(response.data!);

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "현재가 조회 중 오류가 발생했습니다.";

        setError(errorMessage);
        addError({
          message: errorMessage,
          severity: "error",
        });
        console.error("Current price inquiry error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [addError]
  );

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    getCurrentPrice,
    clearData,
  };
};
