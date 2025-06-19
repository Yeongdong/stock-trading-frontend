// 에러 심각도
export type ErrorSeverity = "info" | "warning" | "error";

// 표준 에러 구조
export interface StandardError {
  readonly code: string;
  readonly message: string;
  readonly severity: ErrorSeverity;
  readonly context?: Record<string, string | number | boolean>;
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

// HTTP 에러 응답
export interface HttpErrorResponse {
  readonly status: number;
  readonly message?: string;
}

// 앱 에러
export interface AppError {
  readonly id: string;
  readonly message: string;
  readonly code?: string;
  readonly severity: ErrorSeverity;
  readonly timestamp: Date;
}

// 에러 아이템 Props
export interface ErrorItemProps {
  readonly error: AppError;
  readonly onDismiss: (id: string) => void;
}

// 에러 상태
export interface ErrorState {
  readonly errors: ReadonlyArray<AppError>;
}

// 에러 액션
export type ErrorAction =
  | {
      readonly type: "ADD_ERROR";
      readonly payload: Omit<AppError, "id" | "timestamp">;
    }
  | {
      readonly type: "REMOVE_ERROR";
      readonly payload: string;
    }
  | {
      readonly type: "CLEAR_ERRORS";
    };

// 에러 컨텍스트 타입
export interface ErrorContextType {
  readonly errors: ReadonlyArray<AppError>;
  readonly addError: (error: Omit<AppError, "id" | "timestamp">) => void;
  readonly removeError: (id: string) => void;
  readonly clearErrors: () => void;
}
