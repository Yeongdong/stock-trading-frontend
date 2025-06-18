import { ERROR_MESSAGES } from "@/constants";
import {
  StandardError,
  ERROR_CODES,
  HttpErrorResponse,
} from "@/types/common/error";

export class ErrorHandler {
  static standardize(
    error: unknown,
    context?: Record<string, string | number | boolean>
  ): StandardError {
    if (this.isStandardError(error)) {
      return error;
    }

    if (error instanceof Error) {
      return this.fromError(error, context);
    }

    if (this.isHttpError(error)) {
      return this.fromHttpError(error, context);
    }

    if (typeof error === "string") {
      return {
        code: ERROR_CODES.SYSTEM_UNKNOWN,
        message: error,
        severity: "error",
        context,
      };
    }

    return {
      code: ERROR_CODES.SYSTEM_UNKNOWN,
      message: "알 수 없는 오류가 발생했습니다.",
      severity: "error",
    };
  }

  static fromHttpStatus(
    status: number,
    message?: string,
    context?: Record<string, string | number | boolean>
  ): StandardError {
    const baseMessage = message || "서버 오류가 발생했습니다.";

    switch (Math.floor(status / 100)) {
      case 4:
        if (status === 401) {
          return {
            code: ERROR_CODES.AUTH_INVALID,
            message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
            severity: "error",
            context,
          };
        }
        if (status === 403) {
          return {
            code: ERROR_CODES.AUTH_EXPIRED,
            message: ERROR_MESSAGES.AUTH.SESSION_EXPIRED,
            severity: "warning",
            context,
          };
        }
        if (status === 429) {
          return {
            code: ERROR_CODES.NETWORK_RATE_LIMIT,
            message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
            severity: "warning",
            context,
          };
        }
        return {
          code: ERROR_CODES.VALIDATION_FORMAT,
          message: baseMessage,
          severity: "warning",
          context,
        };

      case 5:
        return {
          code: ERROR_CODES.SYSTEM_UNKNOWN,
          message: baseMessage,
          severity: "error",
          context,
        };

      default:
        return {
          code: ERROR_CODES.NETWORK_CONNECTION,
          message: baseMessage,
          severity: "error",
          context,
        };
    }
  }

  static getSeverityFromCode(code: string): "info" | "warning" | "error" {
    if (
      code === ERROR_CODES.AUTH_EXPIRED ||
      code === ERROR_CODES.NETWORK_RATE_LIMIT
    ) {
      return "warning";
    }

    if (code.startsWith("VALIDATION_")) {
      return "warning";
    }

    return "error";
  }

  private static isStandardError(error: unknown): error is StandardError {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "message" in error &&
      "severity" in error
    );
  }

  private static isHttpError(error: unknown): error is HttpErrorResponse {
    return (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as HttpErrorResponse).status === "number"
    );
  }

  private static fromError(
    error: Error,
    context?: Record<string, string | number | boolean>
  ): StandardError {
    if (error.name === "AbortError") {
      return {
        code: ERROR_CODES.NETWORK_TIMEOUT,
        message: "요청 시간이 초과되었습니다.",
        severity: "warning",
        context,
      };
    }

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return {
        code: ERROR_CODES.NETWORK_CONNECTION,
        message: "네트워크 연결을 확인해주세요.",
        severity: "error",
        context,
      };
    }

    if (error instanceof SyntaxError) {
      return {
        code: ERROR_CODES.SYSTEM_PARSING,
        message: "데이터 형식 오류가 발생했습니다.",
        severity: "error",
        context,
      };
    }

    return {
      code: ERROR_CODES.SYSTEM_UNKNOWN,
      message: error.message,
      severity: "error",
      context,
    };
  }

  private static fromHttpError(
    error: HttpErrorResponse,
    context?: Record<string, string | number | boolean>
  ): StandardError {
    return this.fromHttpStatus(error.status, error.message, context);
  }
}
