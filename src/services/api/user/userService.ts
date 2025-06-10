import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";

export const userService = {
  getCurrentUser: async () => {
    return apiClient.get(API.USER.GET_CURRENT, { requiresAuth: true });
  },

  updateUserInfo: async (
    appKey: string,
    appSecret: string,
    accountNumber: string
  ) => {
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
  ) => {
    try {
      const response = await apiClient.post(
        API.USER.USER_INFO,
        {
          appKey,
          appSecret,
          accountNumber,
        },
        { requiresAuth: true }
      );

      if (response.error) throw new Error(response.error);

      return response.data;
    } catch (error) {
      console.error("KIS 토큰 갱신 실패:", error);
      throw error;
    }
  },
};
