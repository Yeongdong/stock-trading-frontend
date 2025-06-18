export interface StandardError {
  code: string;
  message: string;
  severity: "info" | "warning" | "error";
  context?: Record<string, unknown>;
}

export type ErrorCategory =
  | "AUTH"
  | "NETWORK"
  | "VALIDATION"
  | "BUSINESS"
  | "SYSTEM";

export const ERROR_CODES = {
  // 인증 관련
  AUTH_EXPIRED: "AUTH_001",
  AUTH_REQUIRED: "AUTH_002",
  AUTH_INVALID: "AUTH_003",

  // 네트워크 관련
  NETWORK_TIMEOUT: "NETWORK_001",
  NETWORK_CONNECTION: "NETWORK_002",
  NETWORK_RATE_LIMIT: "NETWORK_003",

  // 검증 관련
  VALIDATION_REQUIRED: "VALIDATION_001",
  VALIDATION_FORMAT: "VALIDATION_002",
  VALIDATION_RANGE: "VALIDATION_003",

  // 비즈니스 로직
  BUSINESS_ORDER_FAIL: "BUSINESS_001",
  BUSINESS_INSUFFICIENT_BALANCE: "BUSINESS_002",
  BUSINESS_MARKET_CLOSED: "BUSINESS_003",

  // 시스템 오류
  SYSTEM_UNKNOWN: "SYSTEM_001",
  SYSTEM_PARSING: "SYSTEM_002",
} as const;
