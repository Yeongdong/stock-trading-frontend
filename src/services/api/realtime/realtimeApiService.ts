import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { ApiResponse } from "@/types/common/api";
import { SubscriptionsResponse } from "@/types";

export const realtimeApiService = {
  startRealTimeService: async (): Promise<ApiResponse> => {
    return apiClient.post(API.REALTIME.START, {}, { requiresAuth: true });
  },

  stopRealTimeService: async (): Promise<ApiResponse> => {
    return apiClient.post(API.REALTIME.STOP, {}, { requiresAuth: true });
  },

  subscribeSymbol: async (symbol: string): Promise<ApiResponse> => {
    return apiClient.post(
      API.REALTIME.SUBSCRIBE(symbol),
      {},
      { requiresAuth: true }
    );
  },

  unsubscribeSymbol: async (symbol: string): Promise<ApiResponse> => {
    return apiClient.delete(API.REALTIME.SUBSCRIBE(symbol), {
      requiresAuth: true,
    });
  },

  getSubscriptions: async (): Promise<ApiResponse<SubscriptionsResponse>> => {
    return apiClient.get<SubscriptionsResponse>(API.REALTIME.SUBSCRIPTIONS, {
      requiresAuth: true,
    });
  },
};
