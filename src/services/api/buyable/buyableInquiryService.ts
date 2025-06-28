import { API } from "@/constants";
import { apiClient } from "../common/apiClient";
import {
  BuyableInquiryRequest,
  BuyableInquiryResponse,
} from "@/types/domains/order/entities";

/**
 * 매수가능금액 조회 서비스
 */
export const buyableInquiryService = {
  getBuyableInquiry: async (
    request: BuyableInquiryRequest
  ): Promise<BuyableInquiryResponse | null> => {
    if (!request.stockCode || !/^\d{6}$/.test(request.stockCode)) return null;

    if (!request.orderPrice || request.orderPrice <= 0) return null;

    const queryParams = new URLSearchParams({
      stockCode: request.stockCode.trim(),
      orderPrice: request.orderPrice.toString(),
      orderType: request.orderType || "00",
    });

    const response = await apiClient.get<BuyableInquiryResponse>(
      `${API.TRADING.BUYABLE_INQUIRY}?${queryParams.toString()}`,
      { requiresAuth: true }
    );

    return response.data || null;
  },
};
