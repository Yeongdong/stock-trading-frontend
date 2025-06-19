import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { ErrorHandler } from "@/utils/errorHandler";
import { Balance } from "@/types/domains/stock";

export const balanceService = {
  getBalance: async (): Promise<Balance> => {
    const response = await apiClient.get<Balance>(API.STOCK.BALANCE, {
      requiresAuth: true,
    });

    if (response.error) {
      const standardError = ErrorHandler.fromHttpStatus(
        response.status,
        response.error
      );
      throw standardError;
    }

    return response.data!;
  },
};
