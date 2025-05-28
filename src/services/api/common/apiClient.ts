import React from "react";
import { useError } from "@/contexts/ErrorContext";
import { ApiOptions, ApiResponse } from "@/types/api/common";

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
        "Content-Type": "application/json",
        ...headers,
      };

      // 요청 옵션 구성
      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
        signal: AbortSignal.timeout(10000), // 10초 타임아웃
      };

      // 요청 실행
      const response = await fetch(url, requestOptions);

      // JSON 응답 파싱
      const responseData = await response.json().catch(() => ({}));

      // 응답 결과 구성
      const result: ApiResponse<T> = {
        data: response.ok ? responseData : undefined,
        error: !response.ok
          ? responseData.message ||
            `HTTP ${response.status}: 요청 처리 중 오류 발생`
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
      let errorMessage = "알 수 없는 오류 발생";
      let errorCode = "UNKNOWN_ERROR";

      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage =
          "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
        errorCode = "NETWORK_ERROR";
      } else if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "요청 시간이 초과되었습니다.";
          errorCode = "TIMEOUT_ERROR";
        } else {
          errorMessage = error.message;
        }
      }

      console.error(`API 요청 실패 [${method} ${url}]:`, error);

      if (handleError && this.errorHandler) {
        this.errorHandler(errorMessage, errorCode);
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
