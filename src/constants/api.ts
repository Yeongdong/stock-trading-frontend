const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7072";

export const API = {
  AUTH: {
    GOOGLE_LOGIN: `${API_BASE_URL}/api/auth/google`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    CHECK_AUTH: `${API_BASE_URL}/api/auth/check`,
  },
  USER: {
    GET_CURRENT: `${API_BASE_URL}/api/user`,
    USER_INFO: `${API_BASE_URL}/api/account/userInfo`,
  },
  STOCK: {
    BALANCE: `${API_BASE_URL}/api/stock/balance`,
    ORDER: `${API_BASE_URL}/api/stock/order`,
    CURRENT_PRICE: `${API_BASE_URL}/api/stock/currentPrice`,
    SEARCH: `${API_BASE_URL}/api/stock/search`,
    GET_BY_CODE: (code: string) => `${API_BASE_URL}/api/stock/${code}`,
    SEARCH_SUMMARY: `${API_BASE_URL}/api/stock/search/summary`,
    UPDATE_FROM_KRX: `${API_BASE_URL}/api/stock/update-from-krx`,
    PERIOD_PRICE: "/api/stock/periodPrice",
  },
  ORDER_EXECUTION: {
    INQUIRY: `${API_BASE_URL}/api/orderexecution`,
  },
  BUYABLE_INQUIRY: {
    GET: `${API_BASE_URL}/api/buyableinquiry`,
  },
  REALTIME: {
    START: `${API_BASE_URL}/api/realtime/start`,
    STOP: `${API_BASE_URL}/api/realtime/stop`,
    SUBSCRIBE: (symbol: string) =>
      `${API_BASE_URL}/api/realtime/subscribe/${symbol}`,
    SUBSCRIPTIONS: `${API_BASE_URL}/api/realtime/subscriptions`,
  },
};
