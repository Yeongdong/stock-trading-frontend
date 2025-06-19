import { ApiResponse } from "@/types/common/api";
import { apiClient } from "../common/apiClient";
import { API } from "@/constants";
import {
  OrderExecutionInquiryRequest,
  OrderExecutionInquiryResponse,
} from "@/types";

/**
 * 주문체결내역 조회 서비스
 */
export const orderExecutionService = {
  getOrderExecutions: async (
    request: OrderExecutionInquiryRequest
  ): Promise<ApiResponse<OrderExecutionInquiryResponse>> => {
    const queryParams = new URLSearchParams({
      startDate: request.startDate,
      endDate: request.endDate,
      orderType: request.orderType,
    });

    if (request.stockCode) queryParams.append("stockCode", request.stockCode);

    return apiClient.get<OrderExecutionInquiryResponse>(
      `${API.ORDER_EXECUTION.INQUIRY}?${queryParams.toString()}`,
      { requiresAuth: true }
    );
  },
};
