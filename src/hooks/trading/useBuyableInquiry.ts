import { useError } from "@/contexts/ErrorContext";
import { buyableInquiryService } from "@/services/api/buyable/buyableInquiryService";
import {
  BuyableInquiryRequest,
  BuyableInquiryResponse,
} from "@/types/trading/buyable";
import { useCallback, useState } from "react";

export const useBuyableInquiry = () => {
  const [data, setData] = useState<BuyableInquiryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addError } = useError();

  const getBuyableInquiry = useCallback(
    async (request: BuyableInquiryRequest) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await buyableInquiryService.getBuyableInquiry(request);
        setData(response);

        addError({
          message: `매수가능조회 완료: ${response.stockName} (${response.stockCode})`,
          severity: "info",
        });

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "매수가능조회 중 오류가 발생했습니다.";

        setError(errorMessage);
        addError({
          message: errorMessage,
          severity: "error",
        });
        console.error("Buyable inquiry error:", err);
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
    getBuyableInquiry,
    clearData,
  };
};
