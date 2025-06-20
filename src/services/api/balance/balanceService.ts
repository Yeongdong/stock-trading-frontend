import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { Balance } from "@/types/domains/stock";
import { ApiResponse } from "@/types/common/api";

/**
 * 잔고 조회 서비스
 */
export const balanceService = {
  getBalance: async (): Promise<Balance | null> => {
    const response: ApiResponse<Balance> = await apiClient.get<Balance>(
      API.STOCK.BALANCE,
      {
        requiresAuth: true,
      }
    );

    if (response.data && !response.error) return response.data;

    return null;
  },
};
