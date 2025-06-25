import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { OverseasAccountBalance } from "@/types/domains/stock/overseas-balance";
import { ApiResponse } from "@/types/common/api";

export const overseasBalanceService = {
  getOverseasBalance: async (): Promise<OverseasAccountBalance | null> => {
    const response: ApiResponse<OverseasAccountBalance> =
      await apiClient.get<OverseasAccountBalance>(
        API.TRADING.OVERSEAS_BALANCE,
        {
          requiresAuth: true,
        }
      );

    if (response.data && !response.error) return response.data;
    return null;
  },
};
