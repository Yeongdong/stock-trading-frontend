// 에러 심각도
export type ErrorSeverity = "info" | "warning" | "error";

// 표준 에러 구조
export interface StandardError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  context?: Record<string, string | number | boolean>;
}

// 에러 코드들
export const ERROR_CODES = {
  // 시스템
  SYSTEM_UNKNOWN: "SYSTEM_UNKNOWN",
  SYSTEM_PARSING: "SYSTEM_PARSING",

  // 네트워크
  NETWORK_CONNECTION: "NETWORK_CONNECTION",
  NETWORK_TIMEOUT: "NETWORK_TIMEOUT",
  NETWORK_RATE_LIMIT: "NETWORK_RATE_LIMIT",

  // 인증
  AUTH_INVALID: "AUTH_INVALID",
  AUTH_EXPIRED: "AUTH_EXPIRED",

  // 검증
  VALIDATION_FORMAT: "VALIDATION_FORMAT",
  VALIDATION_REQUIRED: "VALIDATION_REQUIRED",

  // 비즈니스
  BUSINESS_ORDER_FAIL: "BUSINESS_ORDER_FAIL",
  BUSINESS_STOCK_NOT_FOUND: "BUSINESS_STOCK_NOT_FOUND",

  // 실시간
  REALTIME_CONNECTION_LOST: "REALTIME_CONNECTION_LOST",
  REALTIME_SUBSCRIBE_FAIL: "REALTIME_SUBSCRIBE_FAIL",
} as const;

export interface HttpErrorResponse {
  status: number;
  message?: string;
}

export interface AppError {
  id: string;
  message: string;
  code?: string;
  severity: "info" | "warning" | "error";
  timestamp: Date;
}

export interface ErrorItemProps {
  error: AppError;
  onDismiss: (id: string) => void;
}

export interface ErrorState {
  errors: AppError[];
}

export type ErrorAction =
  | { type: "ADD_ERROR"; payload: Omit<AppError, "id" | "timestamp"> }
  | { type: "REMOVE_ERROR"; payload: string }
  | { type: "CLEAR_ERRORS" };

export interface ErrorContextType {
  errors: AppError[];
  addError: (error: Omit<AppError, "id" | "timestamp">) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}
