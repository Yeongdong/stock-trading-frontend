import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import {
  StockOrder,
  StockBalance,
  CurrentPriceResponse,
  CurrentPriceRequest,
} from "@/types";

export const stockService = {
  getBalance: async () => {
    return apiClient.get<StockBalance>(API.STOCK.BALANCE, {
      requiresAuth: true,
    });
  },

  placeOrder: async (orderData: StockOrder) => {
    return apiClient.post(API.STOCK.ORDER, orderData, { requiresAuth: true });
  },

  getCurrentPrice: async (request: CurrentPriceRequest) => {
    const queryParams = new URLSearchParams({ stockCode: request.stockCode });

    return apiClient.get<CurrentPriceResponse>(
      `${API.STOCK.CURRENT_PRICE}?${queryParams.toString()}`,
      { requiresAuth: true }
    );
  },
};
