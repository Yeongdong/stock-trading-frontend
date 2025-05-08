// API 엔드포인트
export const API = {
  AUTH: {
    GOOGLE_LOGIN: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google`,
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

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  SUBSCRIBED_SYMBOLS: "subscribed_symbols",
  LOGIN_SUCCESS: "loginSuccess",
};

// 에러 메시지
export const ERROR_MESSAGES = {
  REQUIRED_SYMBOL: "종목 코드를 입력하세요.",
  INVALID_SYMBOL: "유효한 종목 코드를 입력해주세요. (6자리 숫자)",
  SUBSCRIBE_FAIL: "종목 구독에 실패했습니다.",
  SUBSCRIBE_ERROR: "종목 구독 중 오류가 발생했습니다.",
  API_ERROR: (status: number, text: string) => `API 오류: ${status} ${text}`,
  SIGNALR_CONNECTION_FAIL: "실시간 데이터 연결 실패",
};

// 예시 종목 코드 (도움말용)
export const EXAMPLE_SYMBOLS = {
  SAMSUNG: "005930",
  SK_HYNIX: "000660",
  KAKAO: "035720",
};

// OAuth 설정
export const AUTH = {
  GOOGLE: {
    CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  },
};

// 시간 관련 상수 (밀리초 단위)
export const TIMINGS = {
  DEBOUNCE: 300,
  THROTTLE: 500,
  SESSION_STORAGE_DELAY: 100,
  STOCK_PRICE_CHECK_INTERVAL: 200,
  RECONNECT_DELAY: 2000, // 2초
};

// 데이터 제한 관련 상수
export const LIMITS = {
  MAX_CHART_DATA_POINTS: 30,
  MAX_RECONNECT_ATTEMPTS: 5,
};

// 애니메이션 관련 상수
export const ANIMATIONS = {
  BLINK_DURATION: 1000, // 1초
};
