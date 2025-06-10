import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { StockBalance } from "@/types/stock/balance";

export const balanceService = {
  getBalance: async (): Promise<StockBalance> => {
    const response = await apiClient.get<StockBalance>(API.STOCK.BALANCE, {
      requiresAuth: true,
    });

    if (response.error) throw new Error(response.error);

    return response.data!;
  },
};
