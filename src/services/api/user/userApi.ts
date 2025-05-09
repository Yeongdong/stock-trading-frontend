import { apiClient } from "@/services/api/common/apiClient";
import { API } from "@/constants";

export const userApi = {
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
};
