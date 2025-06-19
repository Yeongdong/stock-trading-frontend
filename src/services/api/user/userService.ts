import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";
import { ApiResponse } from "@/types/common/api";

/**
 * 사용자 관련 API 서비스
 */
export const userService = {
  getCurrentUser: async (): Promise<ApiResponse> => {
    return apiClient.get(API.USER.GET_CURRENT, { requiresAuth: true });
  },

  updateUserInfo: async (
    appKey: string,
    appSecret: string,
    accountNumber: string
  ): Promise<ApiResponse> => {
    return apiClient.post(
      API.USER.USER_INFO,
      { appKey, appSecret, accountNumber },
      { requiresAuth: true }
    );
  },

  refreshKisToken: async (
    appKey: string,
    appSecret: string,
    accountNumber: string
  ): Promise<ApiResponse> => {
    return apiClient.post(
      API.USER.USER_INFO,
      { appKey, appSecret, accountNumber },
      { requiresAuth: true }
    );
  },
};
