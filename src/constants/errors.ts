export const ERROR_MESSAGES = {
  REQUIRED_SYMBOL: "종목 코드를 입력하세요.",
  INVALID_SYMBOL: "유효한 종목 코드를 입력해주세요. (6자리 숫자)",
  SUBSCRIBE_FAIL: "종목 구독에 실패했습니다.",
  SUBSCRIBE_ERROR: "종목 구독 중 오류가 발생했습니다.",
  API_ERROR: (status: number, text: string) => `API 오류: ${status} ${text}`,
  SIGNALR_CONNECTION_FAIL: "실시간 데이터 연결 실패",
  AUTH: {
    SESSION_EXPIRED: "세션이 만료되었습니다. 다시 로그인해주세요.",
    LOGIN_REQUIRED: "이 기능을 사용하려면 로그인이 필요합니다.",
    TOKEN_MISSING: "인증 토큰이 없습니다. 다시 로그인해주세요.",
    INVALID_CREDENTIALS: "아이디 또는 비밀번호가 올바르지 않습니다.",
    LOGIN_SUCCESS: "로그인에 성공했습니다.",
    LOGOUT_SUCCESS: "로그아웃 되었습니다.",
  },
  ORDER: {
    INVALID_SYMBOL: "유효한 종목 코드를 입력해주세요.",
    INVALID_QUANTITY: "유효한 주문 수량을 입력해주세요.",
    INVALID_PRICE: "유효한 주문 가격을 입력해주세요.",
    ORDER_FAILED: "주문 처리에 실패했습니다.",
    ORDER_SUCCESS: "주문이 성공적으로 접수되었습니다.",
    CONFIRM_REQUIRED: "주문 확인이 필요합니다.",
  },
  REALTIME: {
    CONNECTION_LOST: "실시간 데이터 연결이 끊어졌습니다.",
    RECONNECTING: "서버에 재연결 중입니다...",
    CONNECTION_FAILED: "서버 연결에 실패했습니다.",
    MAX_RECONNECT_ATTEMPTS:
      "최대 재연결 시도 횟수를 초과했습니다. 페이지를 새로고침해주세요.",
    SERVICE_START: "실시간 데이터 서비스가 시작되었습니다.",
    SERVICE_STOP: "실시간 데이터 서비스가 중지되었습니다.",
    SUBSCRIBE_SUCCESS: (symbol: string) =>
      `${symbol} 종목 구독이 완료되었습니다.`,
    UNSUBSCRIBE_SUCCESS: (symbol: string) =>
      `${symbol} 종목 구독이 취소되었습니다.`,
    SUBSCRIBE_FAIL: (symbol: string) => `${symbol} 종목 구독에 실패했습니다.`,
    UNSUBSCRIBE_FAIL: (symbol: string) =>
      `${symbol} 종목 구독 취소에 실패했습니다.`,
  },
  KIS_TOKEN: {
    REQUIRED_APP_KEY: "API 키를 입력해주세요.",
    REQUIRED_APP_SECRET: "API 시크릿을 입력해주세요.",
    REQUIRED_ACCOUNT: "계좌번호를 입력해주세요.",
    TOKEN_SUCCESS: "토큰이 성공적으로 발급되었습니다.",
    TOKEN_FAIL: "토큰 발급에 실패했습니다.",
    TOKEN_EXPIRED: "만료된 토큰입니다.",
  },
  BALANCE: {
    FETCH_FAILED: "잔고 정보를 불러오는데 실패했습니다.",
    EMPTY_POSITIONS: "보유 중인 종목이 없습니다.",
    DATA_LOADING: "잔고 데이터를 불러오는 중...",
    REFRESH_SUCCESS: "잔고 데이터가 갱신되었습니다.",
  },
  NETWORK: {
    OFFLINE: "인터넷 연결이 끊어졌습니다.",
    ONLINE: "인터넷 연결이 복구되었습니다.",
    SLOW_CONNECTION: "인터넷 연결이 불안정합니다.",
  },
  USER: {
    FETCH_FAILED: "사용자 정보를 불러오는데 실패했습니다.",
    NOT_FOUND: "사용자 정보를 찾을 수 없습니다.",
  },
};
