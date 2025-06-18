import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { Balance } from "@/types/domains/stock";

export const balanceService = {
  getBalance: async (): Promise<Balance> => {
    const response = await apiClient.get<Balance>(API.STOCK.BALANCE, {
      requiresAuth: true,
    });

    if (response.error) throw new Error(response.error);

    return response.data!;
  },
};
