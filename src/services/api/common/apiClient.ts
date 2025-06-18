import React from "react";
import { useError } from "@/contexts/ErrorContext";
import { ApiOptions, ApiResponse } from "@/types/api/common";
import { ErrorHandler } from "@/utils/errorHandler";
import { rateLimiter } from "./rateLimiter";
import { ApiPriorityManager } from "./apiPriorityConfig";

export class ApiClient {
  private errorHandler?: (message: string, code: string) => void;
  private requestIdCounter = 0;

  setErrorHandler(handler: (message: string, code: string) => void): void {
    this.errorHandler = handler;
  }

  async get<T>(url: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    return this.executeRequest<T>("GET", url, undefined, options);
  }

  async post<T>(
    url: string,
    data?: unknown,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>("POST", url, data, options);
  }

  async put<T>(
    url: string,
    data?: unknown,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>("PUT", url, data, options);
  }

  async delete<T>(
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
      timeout: 30000,
      ...options,
    };
  }

  private async performHttpRequest<T>(
    url: string,
    method: string,
    data: unknown,
    options: Required<ApiOptions>
  ): Promise<ApiResponse<T>> {
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
  }

  private handleResponseError<T>(
    response: ApiResponse<T>,
    options: Required<ApiOptions>
  ): void {
    if (response.error && options.handleError && this.errorHandler) {
      const standardError = ErrorHandler.fromHttpStatus(
        response.status,
        response.error
      );

      this.errorHandler(standardError.message, standardError.code);
    }
  }

  private handleRequestError<T>(
    error: Error,
    options: Required<ApiOptions>
  ): ApiResponse<T> {
    const standardError = ErrorHandler.standardize(error);

    if (options.handleError && this.errorHandler) {
      this.errorHandler(standardError.message, standardError.code);
    }

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
