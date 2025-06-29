const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "/api" // 운영환경: 프록시 사용
    : "https://localhost:7072/api"; // 개발환경: 직접 호출

export const API = {
  AUTH: {
    GOOGLE_LOGIN: `${API_BASE_URL}/Auth/google`,
    LOGOUT: `${API_BASE_URL}/Auth/logout`,
    CHECK_AUTH: `${API_BASE_URL}/Auth/check`,
    REFRESH: `${API_BASE_URL}/Auth/refresh`,
    MASTER: `${API_BASE_URL}/Auth/master-login`,
  },
  USER: {
    GET_CURRENT: `${API_BASE_URL}/User`,
    USER_INFO: `${API_BASE_URL}/Account/userInfo`,
    DELETE_ACCOUNT: `${API_BASE_URL}/User/account`,
  },
  TRADING: {
    // 국내 주식
    ORDER: `${API_BASE_URL}/Trading/order`,
    BALANCE: `${API_BASE_URL}/Trading/balance`,
    BUYABLE_INQUIRY: `${API_BASE_URL}/Trading/buyable-inquiry`,
    EXECUTIONS: `${API_BASE_URL}/Trading/executions`,

    // 해외 주식
    OVERSEAS_ORDER: `${API_BASE_URL}/Trading/overseas/order`,
    OVERSEAS_BALANCE: `${API_BASE_URL}/Trading/overseas/balance`,
    OVERSEAS_EXECUTIONS: `${API_BASE_URL}/Trading/overseas/executions`,
  },
  MARKET: {
    // 국내 주식 시세
    STOCK_CURRENT_PRICE: `${API_BASE_URL}/market/Price/domestic/current-price`,
    STOCK_PERIOD_PRICE: `${API_BASE_URL}/market/Price/domestic/period-price`,

    // 해외 주식 시세
    OVERSEAS_CURRENT_PRICE: (stockCode: string, market: string) =>
      `${API_BASE_URL}/market/Price/overseas/current-price/${stockCode}?market=${market}`,
    OVERSEAS_PERIOD_PRICE: `${API_BASE_URL}/market/Price/overseas/period-price`,
    STOCK_SEARCH: `${API_BASE_URL}/market/Stock/search`,
    STOCK_GET_BY_CODE: (code: string) => `${API_BASE_URL}/market/Stock/${code}`,
    STOCK_SEARCH_SUMMARY: `${API_BASE_URL}/market/Stock/search/summary`,
    STOCK_UPDATE_FROM_KRX: `${API_BASE_URL}/market/Stock/sync/domestic`,

    // 해외 주식 종목
    OVERSEAS_STOCKS_BY_MARKET: (market: string) =>
      `${API_BASE_URL}/market/Stock/overseas/markets/${market}`,
    FOREIGN_STOCK_SEARCH: `${API_BASE_URL}/market/Stock/overseas/search`,
  },
  REALTIME: {
    START: `${API_BASE_URL}/market/Realtime/start`,
    STOP: `${API_BASE_URL}/market/Realtime/stop`,
    SUBSCRIBE: (symbol: string) =>
      `${API_BASE_URL}/market/Realtime/subscribe/${symbol}`,
    SUBSCRIPTIONS: `${API_BASE_URL}/market/Realtime/subscriptions`,
  },
};
