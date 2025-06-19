import { buyableInquiryService } from "@/services/api/buyable/buyableInquiryService";
import {
  BuyableInquiryRequest,
  BuyableInquiryResponse,
} from "@/types/domains/order/entities";
import { useCallback, useState } from "react";

export const useBuyableInquiry = () => {
  const [data, setData] = useState<BuyableInquiryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getBuyableInquiry = useCallback(
    async (
      request: BuyableInquiryRequest
    ): Promise<BuyableInquiryResponse | null> => {
      try {
        setIsLoading(true);
        const response = await buyableInquiryService.getBuyableInquiry(request);
        setData(response);
        return response;
      } catch (err) {
        console.error("Buyable inquiry error:", err);
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
