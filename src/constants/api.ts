export const API = {
  AUTH: {
    GOOGLE_LOGIN: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google`,
    LOGOUT: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`,
    CHECK_AUTH: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/check`,
  },
  USER: {
    GET_CURRENT: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user`,
    USER_INFO: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/account/userInfo`,
  },
  STOCK: {
    BALANCE: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stock/balance`,
    ORDER: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/stock/order`,
  },
  REALTIME: {
    START: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/realtime/start`,
    STOP: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/realtime/stop`,
    SUBSCRIBE: (symbol: string) =>
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/realtime/subscribe/${symbol}`,
    SUBSCRIPTIONS: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/realtime/subscriptions`,
  },
};
