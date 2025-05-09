import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { StockOrder, StockBalance } from "@/types";

export const stockApi = {
  getBalance: async () => {
    return apiClient.get<StockBalance>(API.STOCK.BALANCE, {
      requiresAuth: true,
    });
  },

  placeOrder: async (orderData: StockOrder) => {
    return apiClient.post(API.STOCK.ORDER, orderData, { requiresAuth: true });
  },
};
