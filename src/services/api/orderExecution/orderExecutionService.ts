import {
  OrderExecutionInquiryRequest,
  OrderExecutionInquiryResponse,
} from "@/types/order/execution";
import { apiClient } from "../common/apiClient";
import { API } from "@/constants";

export const orderExecutionService = {
  getOrderExecutions: async (
    request: OrderExecutionInquiryRequest
  ): Promise<OrderExecutionInquiryResponse> => {
    const queryParams = new URLSearchParams({
      startDate: request.startDate,
      endDate: request.endDate,
      orderType: request.orderType,
    });

    if (request.stockCode) queryParams.append("stockCode", request.stockCode);

    const response = await apiClient.get<OrderExecutionInquiryResponse>(
      `${API.ORDER_EXECUTION.INQUIRY}?${queryParams.toString()}`,
      {
        requiresAuth: true,
      }
    );
    if (response.error) throw new Error(response.error);

    return response.data!;
  },
};
