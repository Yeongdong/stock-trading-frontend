import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { Balance } from "@/types/domains/stock";

/**
 * 잔고 조회 서비스
 */
export const balanceService = {
  getBalance: async (): Promise<Balance | null> => {
    const response = await apiClient.get<Balance>(API.STOCK.BALANCE, {
      requiresAuth: true,
    });

    return response.data || null;
  },
};
