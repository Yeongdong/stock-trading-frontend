const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7072";

export const API = {
  AUTH: {
    GOOGLE_LOGIN: `${API_BASE_URL}/api/auth/google`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    CHECK_AUTH: `${API_BASE_URL}/api/auth/check`,
    MASTER: `${API_BASE_URL}/api/auth/master-login`,
  },
  USER: {
    GET_CURRENT: `${API_BASE_URL}/api/user`,
    USER_INFO: `${API_BASE_URL}/api/account/userInfo`,
  },
  STOCK: {
    BALANCE: `${API_BASE_URL}/api/trading/order/balance`,
    ORDER: `${API_BASE_URL}/api/trading/order`,
    CURRENT_PRICE: `${API_BASE_URL}/api/market/stock/current-price`,
    SEARCH: `${API_BASE_URL}/api/market/stock/search`,
    GET_BY_CODE: (code: string) => `${API_BASE_URL}/api/market/stock/${code}`,
    SEARCH_SUMMARY: `${API_BASE_URL}/api/market/stock/search/summary`,
    UPDATE_FROM_KRX: `${API_BASE_URL}/api/market/stock/update-from-krx`,
    PERIOD_PRICE: `${API_BASE_URL}/api/market/stock/periodPrice`,
  },
  ORDER_EXECUTION: {
    INQUIRY: `${API_BASE_URL}/api/trading/orderexecution`,
  },
  BUYABLE_INQUIRY: {
    GET: `${API_BASE_URL}/api/trading/buyableinquiry`,
  },
  REALTIME: {
    START: `${API_BASE_URL}/api/market/realtime/start`,
    STOP: `${API_BASE_URL}/api/market/realtime/stop`,
    SUBSCRIBE: (symbol: string) =>
      `${API_BASE_URL}/api/market/realtime/subscribe/${symbol}`,
    SUBSCRIPTIONS: `${API_BASE_URL}/api/market/realtime/subscriptions`,
  },
};
