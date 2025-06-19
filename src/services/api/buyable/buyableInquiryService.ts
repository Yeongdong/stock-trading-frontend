import { API } from "@/constants";
import { apiClient } from "../common/apiClient";
import {
  BuyableInquiryRequest,
  BuyableInquiryResponse,
} from "@/types/domains/order/entities";

export const buyableInquiryService = {
  getBuyableInquiry: async (
    request: BuyableInquiryRequest
  ): Promise<BuyableInquiryResponse> => {
    const queryParams = new URLSearchParams({
      stockCode: request.stockCode,
      orderPrice: request.orderPrice.toString(),
      orderType: request.orderType || "00",
    });

    const response = await apiClient.get<BuyableInquiryResponse>(
      `${API.BUYABLE_INQUIRY.GET}?${queryParams.toString()}`,
      { requiresAuth: true }
    );

    if (response.error) throw new Error(response.error);

    return response.data!;
  },
};
