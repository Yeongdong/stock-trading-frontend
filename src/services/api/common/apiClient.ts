import React from "react";
import { useError } from "@/contexts/ErrorContext";
import { ErrorHandler } from "@/utils/errorHandler";
import { ApiOptions, ApiResponse } from "@/types/common/api";
import { requestQueue } from "./requestQueue";

class ApiClient {
  private errorHandler: ((message: string, code: string) => void) | null = null;

  setErrorHandler(handler: (message: string, code: string) => void): void {
    this.errorHandler = handler;
  }

  private getDefaultOptions(): ApiOptions {
    return {
      headers: {},
      requiresAuth: true,
      handleError: true,
      timeout: 30000,
    };
  }

  async get<T = unknown>(
    url: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, "GET", undefined, options);
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, "POST", data, options);
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, "PUT", data, options);
  }

  async delete<T = unknown>(
    url: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, "DELETE", undefined, options);
  }

  private async request<T>(
    url: string,
    method: string,
    data?: unknown,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const finalOptions = { ...this.getDefaultOptions(), ...options };

    // 글로벌 큐를 통해 요청 실행
    return requestQueue.add(async () => {
      return this.executeRequest<T>(
        url,
        method,
        data || undefined,
        finalOptions
      );
    });
  }

  private async executeRequest<T>(
    url: string,
    method: string,
    data: unknown,
    options: ApiOptions
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
        signal: AbortSignal.timeout(options.timeout || 30000),
      });

      const responseData = await response.json().catch(() => ({}));

      const apiResponse = {
        data: response.ok ? responseData : undefined,
        error: !response.ok
          ? responseData.message ||
            `HTTP ${response.status}: 요청 처리 중 오류 발생`
          : undefined,
        status: response.status,
      };

      if (apiResponse.error && options.handleError)
        this.handleResponseError(apiResponse);

      return apiResponse;
    } catch (error) {
      return this.handleRequestError<T>(error as Error);
    }
  }

  private handleResponseError<T>(response: ApiResponse<T>): void {
    if (this.errorHandler) {
      const standardError = ErrorHandler.fromHttpStatus(
        response.status,
        response.error
      );
      this.errorHandler(standardError.message, standardError.code);
    }
  }

  private handleRequestError<T>(error: Error): ApiResponse<T> {
    const standardError = ErrorHandler.standardize(error);

    if (this.errorHandler)
      this.errorHandler(standardError.message, standardError.code);

    return {
      error: standardError.message,
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
        severity: ErrorHandler.getSeverityFromCode(code),
      });
    });
  }, [addError]);

  return apiClient;
};
