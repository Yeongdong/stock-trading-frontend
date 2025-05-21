import React from "react";
import { useError } from "@/contexts/ErrorContext";
import { ApiOptions, ApiResponse } from "@/types/api/common";
import { csrfService } from "@/services/security/csrfService";

class ApiClient {
  // 오류 핸들러 저장
  private errorHandler: ((message: string, code?: string) => void) | null =
    null;

  // 오류 핸들러 설정 메서드
  setErrorHandler(handler: (message: string, code?: string) => void): void {
    this.errorHandler = handler;
  }

  // GET
  async get<T>(url: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, "GET", undefined, options);
  }

  // POST
  async post<T, D = unknown>(
    url: string,
    data: D,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, "POST", data, options);
  }

  // PUT
  async put<T, D = unknown>(
    url: string,
    data: D,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, "PUT", data, options);
  }

  // DELETE
  async delete<T>(
    url: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, "DELETE", undefined, options);
  }

  // 공통 요청 처리
  private async request<T>(
    url: string,
    method: string,
    data?: unknown,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const { headers = {}, handleError = true } = options;

    try {
      const requestHeaders: Record<string, string> = {
        "Content-Type": "application-json",
        ...headers,
      };

      if (method !== "GET" && method !== "HEAD") {
        try {
          const csrfToken = await csrfService.getCsrfToken();
          requestHeaders["X-XSRF-TOKEN"] = csrfToken;
        } catch (error) {
          console.warn("CSRF 토큰 설정 실패:", error);
        }
      }

      // 요청 옵션 구성
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      };

      // 요청 실행
      const response = await fetch(url, requestOptions);

      // JSON 응답 파싱
      const responseData = await response.json().catch(() => ({}));

      // 응답 결과 구성
      const result: ApiResponse<T> = {
        data: response.ok ? responseData : undefined,
        error: !response.ok
          ? responseData.message || "요청 처리 중 오류 발생"
          : undefined,
        status: response.status,
      };

      // 오류 처리
      if (!response.ok && handleError && this.errorHandler) {
        const errorCode = responseData.code || response.status.toString();
        this.errorHandler(result.error!, errorCode);
      }

      return result;
    } catch (error) {
      // 네트워크 오류 등 예외 처리
      const errorMessage =
        error instanceof Error ? error.message : "알 수 없는 오류 발생";

      if (handleError && this.errorHandler) {
        this.errorHandler(errorMessage);
      }
      return {
        error: errorMessage,
        status: 0, // 네트워크 오류는 상태 코드 0으로 표시
      };
    }
  }
}

export const apiClient = new ApiClient();

export const useApiClient = () => {
  const { addError } = useError();

  // 컴포넌트 마운트시 오류 핸들러 설정
  React.useEffect(() => {
    apiClient.setErrorHandler((message, code) => {
      addError({
        message,
        code,
        severity: "error",
      });
    });
  }, [addError]);
  return apiClient;
};
