const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const API = {
  AUTH: {
    GOOGLE_LOGIN: `${API_BASE_URL}/api/Auth/google`,
    LOGOUT: `${API_BASE_URL}/api/Auth/logout`,
    CHECK_AUTH: `${API_BASE_URL}/api/Auth/check`,
    REFRESH: `${API_BASE_URL}/api/Auth/refresh`,
    MASTER: `${API_BASE_URL}/api/Auth/master-login`,
  },
  USER: {
    GET_CURRENT: `${API_BASE_URL}/api/User`,
    USER_INFO: `${API_BASE_URL}/api/Account/userInfo`,
    DELETE_ACCOUNT: `${API_BASE_URL}/api/User/account`,
  },
  TRADING: {
    // 국내 주식
    ORDER: `${API_BASE_URL}/api/Trading/order`,
    BALANCE: `${API_BASE_URL}/api/Trading/balance`,
    BUYABLE_INQUIRY: `${API_BASE_URL}/api/Trading/buyable-inquiry`,
    EXECUTIONS: `${API_BASE_URL}/api/Trading/executions`,

    // 해외 주식
    OVERSEAS_ORDER: `${API_BASE_URL}/api/Trading/overseas/order`,
    OVERSEAS_BALANCE: `${API_BASE_URL}/api/Trading/overseas/balance`,
    OVERSEAS_EXECUTIONS: `${API_BASE_URL}/api/Trading/overseas/executions`,
  },
  MARKET: {
    // 국내 주식 시세
    STOCK_CURRENT_PRICE: `${API_BASE_URL}/api/market/Price/domestic/current-price`,
    STOCK_PERIOD_PRICE: `${API_BASE_URL}/api/market/Price/domestic/period-price`,

    // 해외 주식 시세
    OVERSEAS_CURRENT_PRICE: (stockCode: string, market: string) =>
      `${API_BASE_URL}/api/market/Price/overseas/current-price/${stockCode}?market=${market}`,
    OVERSEAS_PERIOD_PRICE: `${API_BASE_URL}/api/market/Price/overseas/period-price`,
    STOCK_SEARCH: `${API_BASE_URL}/api/market/Stock/search`,
    STOCK_GET_BY_CODE: (code: string) =>
      `${API_BASE_URL}/api/market/Stock/${code}`,
    STOCK_SEARCH_SUMMARY: `${API_BASE_URL}/api/market/Stock/search/summary`,
    STOCK_UPDATE_FROM_KRX: `${API_BASE_URL}/api/market/Stock/sync/domestic`,

    // 해외 주식 종목
    OVERSEAS_STOCKS_BY_MARKET: (market: string) =>
      `${API_BASE_URL}/api/market/Stock/overseas/markets/${market}`,
    FOREIGN_STOCK_SEARCH: `${API_BASE_URL}/api/market/Stock/overseas/search`,
  },
  REALTIME: {
    START: `${API_BASE_URL}/api/market/Realtime/start`,
    STOP: `${API_BASE_URL}/api/market/Realtime/stop`,
    SUBSCRIBE: (symbol: string) =>
      `${API_BASE_URL}/api/market/Realtime/subscribe/${symbol}`,
    SUBSCRIPTIONS: `${API_BASE_URL}/api/market/Realtime/subscriptions`,
  },
};
