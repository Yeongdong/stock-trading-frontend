import { ERROR_CODES, HttpErrorResponse } from "@/types/common/error";
import { ErrorService } from "../errorService";

describe("ErrorService", () => {
  describe("standardize", () => {
    it("Error 객체를 StandardError로 변환한다", () => {
      const error = new Error("테스트 에러");
      const result = ErrorService.standardize(error);

      expect(result).toEqual({
        code: ERROR_CODES.SYSTEM_UNKNOWN,
        message: "테스트 에러",
        severity: "error",
      });
    });

    it("AbortError를 네트워크 타임아웃 에러로 변환한다", () => {
      const abortError = new Error("요청이 중단되었습니다");
      abortError.name = "AbortError";

      const result = ErrorService.standardize(abortError);

      expect(result).toEqual({
        code: ERROR_CODES.NETWORK_TIMEOUT,
        message: "요청 시간이 초과되었습니다.",
        severity: "warning",
      });
    });

    it("fetch TypeError를 네트워크 연결 에러로 변환한다", () => {
      const networkError = new TypeError("Failed to fetch");

      const result = ErrorService.standardize(networkError);

      expect(result).toEqual({
        code: ERROR_CODES.NETWORK_CONNECTION,
        message: "네트워크 연결을 확인해주세요.",
        severity: "error",
      });
    });

    it("HTTP 에러 객체를 변환한다", () => {
      const httpError: HttpErrorResponse = {
        status: 404,
        message: "리소스를 찾을 수 없습니다",
      };

      const result = ErrorService.standardize(httpError);

      expect(result).toEqual({
        code: ERROR_CODES.VALIDATION_FORMAT,
        message: "리소스를 찾을 수 없습니다",
        severity: "warning",
      });
    });

    it("문자열 에러를 변환한다", () => {
      const errorString = "사용자 정의 에러 메시지";
      const result = ErrorService.standardize(errorString);

      expect(result).toEqual({
        code: ERROR_CODES.SYSTEM_UNKNOWN,
        message: errorString,
        severity: "error",
      });
    });

    it("알 수 없는 에러를 기본 메시지로 변환한다", () => {
      const unknownError = { unknown: "property" };
      const result = ErrorService.standardize(unknownError);

      expect(result).toEqual({
        code: ERROR_CODES.SYSTEM_UNKNOWN,
        message: "알 수 없는 오류가 발생했습니다.",
        severity: "error",
      });
    });
  });

  describe("fromHttpStatus", () => {
    it("401 상태를 인증 에러로 변환한다", () => {
      const result = ErrorService.fromHttpStatus(401);

      expect(result).toEqual({
        code: ERROR_CODES.AUTH_INVALID,
        message: "인증이 필요합니다.",
        severity: "error",
      });
    });

    it("403 상태를 세션 만료 에러로 변환한다", () => {
      const result = ErrorService.fromHttpStatus(403);

      expect(result).toEqual({
        code: ERROR_CODES.AUTH_EXPIRED,
        message: "세션이 만료되었습니다.",
        severity: "warning",
      });
    });

    it("429 상태를 요청 제한 에러로 변환한다", () => {
      const result = ErrorService.fromHttpStatus(429);

      expect(result).toEqual({
        code: ERROR_CODES.NETWORK_RATE_LIMIT,
        message: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        severity: "warning",
      });
    });

    it("400번대 에러를 검증 에러로 변환한다", () => {
      const customMessage = "잘못된 요청입니다";
      const result = ErrorService.fromHttpStatus(400, customMessage);

      expect(result).toEqual({
        code: ERROR_CODES.VALIDATION_FORMAT,
        message: customMessage,
        severity: "warning",
      });
    });

    it("500번대 에러를 시스템 에러로 변환한다", () => {
      const result = ErrorService.fromHttpStatus(500, "서버 내부 에러");

      expect(result).toEqual({
        code: ERROR_CODES.SYSTEM_UNKNOWN,
        message: "서버 내부 에러",
        severity: "error",
      });
    });

    it("메시지가 없을 때 기본 메시지를 사용한다", () => {
      const result = ErrorService.fromHttpStatus(500);

      expect(result).toEqual({
        code: ERROR_CODES.SYSTEM_UNKNOWN,
        message: "서버 오류가 발생했습니다.",
        severity: "error",
      });
    });
  });

  describe("getSeverityFromCode", () => {
    it("인증 만료 코드를 warning으로 분류한다", () => {
      const severity = ErrorService.getSeverityFromCode(
        ERROR_CODES.AUTH_EXPIRED
      );
      expect(severity).toBe("warning");
    });

    it("요청 제한 코드를 warning으로 분류한다", () => {
      const severity = ErrorService.getSeverityFromCode(
        ERROR_CODES.NETWORK_RATE_LIMIT
      );
      expect(severity).toBe("warning");
    });

    it("검증 에러 코드를 warning으로 분류한다", () => {
      const severity = ErrorService.getSeverityFromCode(
        ERROR_CODES.VALIDATION_FORMAT
      );
      expect(severity).toBe("warning");
    });

    it("시스템 에러 코드를 error로 분류한다", () => {
      const severity = ErrorService.getSeverityFromCode(
        ERROR_CODES.SYSTEM_UNKNOWN
      );
      expect(severity).toBe("error");
    });

    it("네트워크 연결 에러를 error로 분류한다", () => {
      const severity = ErrorService.getSeverityFromCode(
        ERROR_CODES.NETWORK_CONNECTION
      );
      expect(severity).toBe("error");
    });
  });
});
