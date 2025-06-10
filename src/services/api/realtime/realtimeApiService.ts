import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { ApiResponse } from "@/types/api/common";
import { SubscriptionsResponse } from "@/types/api/realtime";

export const realtimeApiService = {
  // 실시간 데이터 서비스 시작
  startRealTimeService: async (): Promise<ApiResponse> => {
    return apiClient.post(
      API.REALTIME.START,
      {},
      {
        requiresAuth: true,
      }
    );
  },

  // 실시간 데이터 서비스 중지
  stopRealTimeService: async (): Promise<ApiResponse> => {
    return apiClient.post(
      API.REALTIME.STOP,
      {},
      {
        requiresAuth: true,
      }
    );
  },

  // 종목 구독
  subscribeSymbol: async (symbol: string): Promise<ApiResponse> => {
    return apiClient.post(
      API.REALTIME.SUBSCRIBE(symbol),
      {},
      {
        requiresAuth: true,
      }
    );
  },

  // 종목 구독 취소
  unsubscribeSymbol: async (symbol: string): Promise<ApiResponse> => {
    return apiClient.delete(API.REALTIME.SUBSCRIBE(symbol), {
      requiresAuth: true,
    });
  },

  // 구독 중인 종목 목록 조회
  getSubscriptions: async (): Promise<ApiResponse<SubscriptionsResponse>> => {
    return apiClient.get<SubscriptionsResponse>(API.REALTIME.SUBSCRIPTIONS, {
      requiresAuth: true,
    });
  },
};
