// src/api/realtimeApi.ts

import { apiClient } from "@/services/apiClient";
import { API } from "@/constants";
import { SubscriptionsResponse } from "@/types/api";

export const realtimeApi = {
  // 실시간 데이터 서비스 시작
  startRealTimeService: async () => {
    return apiClient.post(
      API.REALTIME.START,
      {},
      {
        requiresAuth: true,
      }
    );
  },

  // 실시간 데이터 서비스 중지
  stopRealTimeService: async () => {
    return apiClient.post(
      API.REALTIME.STOP,
      {},
      {
        requiresAuth: true,
      }
    );
  },

  // 종목 구독
  subscribeSymbol: async (symbol: string) => {
    return apiClient.post(
      API.REALTIME.SUBSCRIBE(symbol),
      {},
      {
        requiresAuth: true,
      }
    );
  },

  // 종목 구독 취소
  unsubscribeSymbol: async (symbol: string) => {
    return apiClient.delete(API.REALTIME.SUBSCRIBE(symbol), {
      requiresAuth: true,
    });
  },

  // 구독 중인 종목 목록 조회
  getSubscriptions: async () => {
    return apiClient.get<SubscriptionsResponse>(API.REALTIME.SUBSCRIPTIONS, {
      requiresAuth: true,
    });
  },
};
