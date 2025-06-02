import {
  OrderExecutionInquiryRequest,
  OrderExecutionInquiryResponse,
} from "@/types/order/execution";
import { apiClient } from "../common/apiClient";
import { API } from "@/constants";

export const orderExecutionService = {
  getOrderExecutions: async (request: OrderExecutionInquiryRequest) => {
    const queryParams = new URLSearchParams({
      startDate: request.startDate,
      endDate: request.endDate,
      orderType: request.orderType,
    });

    if (request.stockCode) queryParams.append("stockCode", request.stockCode);

    return await apiClient.get<OrderExecutionInquiryResponse>(
      `${API.ORDER_EXECUTION.INQUIRY}?${queryParams.toString()}`,
      {
        requiresAuth: true,
      }
    );
  },
};
