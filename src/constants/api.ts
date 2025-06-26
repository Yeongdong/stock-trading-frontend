const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const API = {
  AUTH: {
    GOOGLE_LOGIN: `${API_BASE_URL}/api/auth/google`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    CHECK_AUTH: `${API_BASE_URL}/api/auth/check`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
    MASTER: `${API_BASE_URL}/api/auth/master-login`,
  },
  USER: {
    GET_CURRENT: `${API_BASE_URL}/api/user`,
    USER_INFO: `${API_BASE_URL}/api/account/userInfo`,
    DELETE_ACCOUNT: `${API_BASE_URL}/api/user/account`,
  },
  TRADING: {
    // 국내 주식
    ORDER: `${API_BASE_URL}/api/trading/order`,
    BALANCE: `${API_BASE_URL}/api/trading/balance`,
    BUYABLE_INQUIRY: `${API_BASE_URL}/api/trading/buyable-inquiry`,
    EXECUTIONS: `${API_BASE_URL}/api/trading/executions`,

    // 해외 주식
    OVERSEAS_ORDER: `${API_BASE_URL}/api/trading/overseas/order`,
    OVERSEAS_BALANCE: `${API_BASE_URL}/api/trading/overseas/balance`,
    OVERSEAS_EXECUTIONS: `${API_BASE_URL}/api/trading/overseas/executions`,
  },
  MARKET: {
    // 국내 주식
    STOCK_CURRENT_PRICE: `${API_BASE_URL}/api/market/price/domestic/current-price`,
    STOCK_PERIOD_PRICE: `${API_BASE_URL}/api/market/price/domestic/period-price`,
    STOCK_SEARCH: `${API_BASE_URL}/api/market/stock/search`,
    STOCK_GET_BY_CODE: (code: string) =>
      `${API_BASE_URL}/api/market/stock/${code}`,
    STOCK_SEARCH_SUMMARY: `${API_BASE_URL}/api/market/stock/search/summary`,
    STOCK_UPDATE_FROM_KRX: `${API_BASE_URL}/api/market/stock/sync/domestic`,

    // 해외 주식
    OVERSEAS_CURRENT_PRICE: (stockCode: string, market: string) =>
      `${API_BASE_URL}/api/market/price/overseas/current-price/${stockCode}?market=${market}`,
    OVERSEAS_STOCKS_BY_MARKET: (market: string) =>
      `${API_BASE_URL}/api/market/stock/overseas/markets/${market}`,
    FOREIGN_STOCK_SEARCH: `${API_BASE_URL}/api/market/stock/overseas/search`,
  },
  REALTIME: {
    START: `${API_BASE_URL}/api/market/realtime/start`,
    STOP: `${API_BASE_URL}/api/market/realtime/stop`,
    SUBSCRIBE: (symbol: string) =>
      `${API_BASE_URL}/api/market/realtime/subscribe/${symbol}`,
    SUBSCRIPTIONS: `${API_BASE_URL}/api/market/realtime/subscriptions`,
  },
};
