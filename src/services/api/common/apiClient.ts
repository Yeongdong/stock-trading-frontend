import React from "react";
import { useError } from "@/contexts/ErrorContext";
import { ApiOptions, ApiResponse } from "@/types/api/common";
import {
  rateLimiter,
  RateLimitError,
  RequestTimeoutError,
} from "./rateLimiter";
import { ApiPriorityManager } from "./apiPriorityConfig";

class ApiClient {
  private errorHandler: ((message: string, code?: string) => void) | null =
    null;
  private requestIdCounter = 0;

  setErrorHandler(handler: (message: string, code?: string) => void): void {
    this.errorHandler = handler;
  }

  async get<T = void>(
    url: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>("GET", url, undefined, options);
  }

  async post<T = void, D = unknown>(
    url: string,
    data: D,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>("POST", url, data, options);
  }

  async put<T = void, D = unknown>(
    url: string,
    data: D,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>("PUT", url, data, options);
  }

  async delete<T = void>(
    url: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>("DELETE", url, undefined, options);
  }

  private async executeRequest<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    data?: unknown,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const finalOptions = this.buildOptions(url, method, options);
    const requestId = `${method}-${++this.requestIdCounter}-${Date.now()}`;

    try {
      const result = await rateLimiter.enqueue<ApiResponse<T>>(
        requestId,
        finalOptions.priority!,
        url,
        method,
        () => this.performHttpRequest<T>(url, method, data, finalOptions),
        finalOptions.maxRetries
      );

      this.handleResponseError(result, finalOptions);
      return result;
    } catch (error) {
      return this.handleRequestError<T>(error as Error, finalOptions);
    }
  }

  private buildOptions(
    url: string,
    method: string,
    options: ApiOptions
  ): Required<ApiOptions> {
    return {
      headers: {},
      requiresAuth: false,
      handleError: true,
      priority: ApiPriorityManager.determinePriority(url, method),
      maxRetries: 3,
      timeout: 10000,
      ...options,
    };
  }

  private async performHttpRequest<T>(
    url: string,
    method: string,
    data: unknown,
    options: Required<ApiOptions>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
        signal: AbortSignal.timeout(options.timeout),
      });

      const responseData = await response.json().catch(() => ({}));

      return {
        data: response.ok ? responseData : undefined,
        error: !response.ok
          ? responseData.message ||
            `HTTP ${response.status}: 요청 처리 중 오류 발생`
          : undefined,
        status: response.status,
      };
    } catch (error) {
      throw this.transformError(error as Error);
    }
  }

  private transformError(error: Error): Error {
    if (error.name === "AbortError") {
      return new RequestTimeoutError();
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return new Error(
        "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요."
      );
    }

    return error;
  }

  private handleResponseError<T>(
    response: ApiResponse<T>,
    options: Required<ApiOptions>
  ): void {
    if (response.error && options.handleError && this.errorHandler) {
      this.errorHandler(response.error, response.status.toString());
    }
  }

  private handleRequestError<T>(
    error: Error,
    options: Required<ApiOptions>
  ): ApiResponse<T> {
    let errorMessage = "알 수 없는 오류 발생";
    let errorCode = "UNKNOWN_ERROR";

    if (error instanceof RequestTimeoutError) {
      errorMessage = "요청 시간이 초과되었습니다.";
      errorCode = "TIMEOUT_ERROR";
    } else if (error instanceof RateLimitError) {
      errorMessage = error.message;
      errorCode = "RATE_LIMIT_ERROR";
    } else if (error.message.includes("네트워크")) {
      errorMessage = error.message;
      errorCode = "NETWORK_ERROR";
    } else {
      errorMessage = error.message;
    }

    console.error("API 요청 실패:", error);

    if (options.handleError && this.errorHandler) {
      this.errorHandler(errorMessage, errorCode);
    }

    return {
      error: errorMessage,
      status: 0,
    };
  }
}

export const apiClient = new ApiClient();

export const useApiClient = () => {
  const { addError } = useError();

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
