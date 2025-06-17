// 시간 관련 상수 (밀리초 단위)
export const TIMINGS = {
  DEBOUNCE: 300,
  THROTTLE: 500,
  SESSION_STORAGE_DELAY: 100,
  STOCK_PRICE_CHECK_INTERVAL: 200,
  RECONNECT_DELAY: 2000, // 2초
} as const;

// 데이터 제한 관련 상수
export const LIMITS = {
  MAX_CHART_DATA_POINTS: 30,
  MAX_RECONNECT_ATTEMPTS: 5,
} as const;

// 애니메이션 관련 상수
export const ANIMATIONS = {
  BLINK_DURATION: 1000, // 1초
} as const;

// 예시 종목 코드 (도움말용)
export const EXAMPLE_SYMBOLS = {
  SAMSUNG: "005930",
  SK_HYNIX: "000660",
  KAKAO: "035720",
} as const;

// UI 메시지 상수
export const UI_MESSAGES = {
  STOCK_INPUT: {
    PLACEHOLDER: "종목 코드 (예: 005930)",
    SUBMIT_LOADING: "처리중...",
    SUBMIT_DEFAULT: "구독",
    HELP_TEXT: "* 삼성전자: 005930, SK하이닉스: 000660, 카카오: 035720",
    ARIA_LABEL: "종목 코드 입력",
    ARIA_SUBMIT: "종목 구독",
  },
  MARKET_STATUS: {
    SERVICE_SUSPENDED: "실시간 서비스 일시 중단",
    MARKET_HOURS:
      "한국거래소는 평일 오전 9시부터 오후 3시 30분까지 운영됩니다.",
    NO_REALTIME_DATA: "장 시간 외에는 실시간 데이터를 제공하지 않습니다.",
    NEXT_OPEN: "다음 장 시작:",
  },
} as const;

// 예시 종목 정보
export const EXAMPLE_STOCK_INFO = [
  { name: "삼성전자", code: EXAMPLE_SYMBOLS.SAMSUNG },
  { name: "SK하이닉스", code: EXAMPLE_SYMBOLS.SK_HYNIX },
  { name: "카카오", code: EXAMPLE_SYMBOLS.KAKAO },
] as const;
