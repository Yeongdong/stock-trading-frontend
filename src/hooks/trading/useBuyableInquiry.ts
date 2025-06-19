import { buyableInquiryService } from "@/services/api/buyable/buyableInquiryService";
import {
  BuyableInquiryRequest,
  BuyableInquiryResponse,
} from "@/types/domains/order/entities";
import { useCallback, useState } from "react";

/**
 * 매수가능금액 조회 훅
 */
export const useBuyableInquiry = () => {
  const [data, setData] = useState<BuyableInquiryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getBuyableInquiry = useCallback(
    async (
      request: BuyableInquiryRequest
    ): Promise<BuyableInquiryResponse | null> => {
      setIsLoading(true);

      try {
        const response = await buyableInquiryService.getBuyableInquiry(request);

        setData(response);
        return response;
      } catch {
        setData(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  return {
    data,
    isLoading,
    getBuyableInquiry,
    clearData,
  };
};
