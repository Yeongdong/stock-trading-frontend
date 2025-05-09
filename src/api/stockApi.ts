import { apiClient } from "@/services/apiClient";
import { API } from "@/constants";
import { StockBalance, StockOrder } from "@/types/stock";

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
