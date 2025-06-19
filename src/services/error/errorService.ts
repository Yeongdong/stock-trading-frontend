import {
  StandardError,
  ERROR_CODES,
  HttpErrorResponse,
} from "@/types/common/error";

export class ErrorService {
  static standardize(error: unknown): StandardError {
    if (error instanceof Error) return this.fromError(error);

    if (this.isHttpError(error))
      return this.fromHttpStatus(error.status, error.message);

    if (typeof error === "string")
      return {
        code: ERROR_CODES.SYSTEM_UNKNOWN,
        message: error,
        severity: "error",
      };

    return {
      code: ERROR_CODES.SYSTEM_UNKNOWN,
      message: "알 수 없는 오류가 발생했습니다.",
      severity: "error",
    };
  }

  static fromHttpStatus(status: number, message?: string): StandardError {
    const baseMessage = message || "서버 오류가 발생했습니다.";

    if (status === 401)
      return {
        code: ERROR_CODES.AUTH_INVALID,
        message: "인증이 필요합니다.",
        severity: "error",
      };

    if (status === 403)
      return {
        code: ERROR_CODES.AUTH_EXPIRED,
        message: "세션이 만료되었습니다.",
        severity: "warning",
      };

    if (status === 429)
      return {
        code: ERROR_CODES.NETWORK_RATE_LIMIT,
        message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        severity: "warning",
      };

    if (status >= 400 && status < 500)
      return {
        code: ERROR_CODES.VALIDATION_FORMAT,
        message: baseMessage,
        severity: "warning",
      };

    return {
      code: ERROR_CODES.SYSTEM_UNKNOWN,
      message: baseMessage,
      severity: "error",
    };
  }

  static getSeverityFromCode(code: string): "info" | "warning" | "error" {
    if (
      code === ERROR_CODES.AUTH_EXPIRED ||
      code === ERROR_CODES.NETWORK_RATE_LIMIT
    )
      return "warning";

    if (code.startsWith("VALIDATION_")) return "warning";

    return "error";
  }

  private static fromError(error: Error): StandardError {
    if (error.name === "AbortError")
      return {
        code: ERROR_CODES.NETWORK_TIMEOUT,
        message: "요청 시간이 초과되었습니다.",
        severity: "warning",
      };

    if (error.name === "TypeError" && error.message.includes("fetch"))
      return {
        code: ERROR_CODES.NETWORK_CONNECTION,
        message: "네트워크 연결을 확인해주세요.",
        severity: "error",
      };

    return {
      code: ERROR_CODES.SYSTEM_UNKNOWN,
      message: error.message,
      severity: "error",
    };
  }

  private static isHttpError(error: unknown): error is HttpErrorResponse {
    return (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as HttpErrorResponse).status === "number"
    );
  }
}
