import React from "react";
import { useError } from "@/contexts/ErrorContext";
import { ApiOptions, ApiResponse } from "@/types/common/api";
import { ERROR_CODES } from "@/types/common/error";
import { requestQueue } from "./requestQueue";
import { ErrorService } from "@/services/error/errorService";
import { authService } from "@/services/api/auth/authService";
import { tokenStorage } from "../auth/tokenStorage";

class ApiClient {
  private errorHandler: ((message: string, code: string) => void) | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  private isRedirecting = false;

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

    if (finalOptions.requiresAuth && tokenStorage.isAccessTokenExpiringSoon())
      await this.ensureValidToken();

    return requestQueue.add(async () => {
      return this.executeRequestWithRetry<T>(url, method, data, finalOptions);
    });
  }

  private async executeRequestWithRetry<T>(
    url: string,
    method: string,
    data: unknown,
    options: ApiOptions
  ): Promise<ApiResponse<T>> {
    let response = await this.executeRequest<T>(url, method, data, options);

    if (this.isAuthError(response.status) && options.requiresAuth) {
      const currentToken = tokenStorage.getAccessToken();
      if (!currentToken) {
        this.handleAuthFailure();
        return this.createAuthErrorResponse<T>();
      }

      const tokenRefreshed = await this.ensureValidToken();

      if (tokenRefreshed) {
        response = await this.executeRequest<T>(url, method, data, options);
      } else {
        this.handleAuthFailure();
        return this.createAuthErrorResponse<T>();
      }
    }

    return response;
  }

  private async executeRequest<T>(
    url: string,
    method: string,
    data: unknown,
    options: ApiOptions
  ): Promise<ApiResponse<T>> {
    const headers = this.buildHeaders(options);

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: AbortSignal.timeout(options.timeout || 30000),
    });

    const responseData = await response.json().catch(() => ({}));

    const apiResponse: ApiResponse<T> = {
      data: response.ok ? responseData : undefined,
      error: !response.ok
        ? this.extractErrorMessage(responseData, response.status)
        : undefined,
      status: response.status,
    };

    if (apiResponse.error && options.handleError)
      this.handleResponseError(apiResponse);

    return apiResponse;
  }

  private buildHeaders(options: ApiOptions): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (options.requiresAuth) {
      const accessToken = tokenStorage.getAccessToken();
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    }

    return headers;
  }

  private async ensureValidToken(): Promise<boolean> {
    // 이미 갱신 중이면 해당 Promise 기다림
    if (this.refreshPromise) return this.refreshPromise;

    const currentToken = tokenStorage.getAccessToken();
    if (currentToken && !tokenStorage.isAccessTokenExpiringSoon()) return true;

    this.refreshPromise = this.performTokenRefresh();

    const result = await this.refreshPromise;
    this.refreshPromise = null;

    return result;
  }

  private async performTokenRefresh(): Promise<boolean> {
    const refreshSuccess = await authService.silentRefresh();

    if (!refreshSuccess) {
      tokenStorage.clearAccessToken();
      this.handleAuthFailure();
    }

    return refreshSuccess;
  }

  private handleAuthFailure(): void {
    if (this.isRedirecting) return;
    this.isRedirecting = true;

    tokenStorage.clearAccessToken();

    if (this.errorHandler)
      this.errorHandler(
        "세션이 만료되었습니다. 다시 로그인해주세요.",
        ERROR_CODES.AUTH_EXPIRED
      );
  }

  private isAuthError(status: number): boolean {
    return status === 401 || status === 403;
  }

  private createAuthErrorResponse<T>(): ApiResponse<T> {
    return {
      error: "인증이 필요합니다. 다시 로그인해주세요.",
      status: 401,
    };
  }

  private extractErrorMessage(responseData: unknown, status: number): string {
    if (responseData && typeof responseData === "object") {
      const data = responseData as Record<string, unknown>;
      if (typeof data.message === "string") return data.message;
      if (typeof data.error === "string") return data.error;
    }

    return `HTTP ${status}: 요청 처리 중 오류 발생`;
  }

  private handleResponseError<T>(response: ApiResponse<T>): void {
    if (this.errorHandler) {
      const standardError = ErrorService.fromHttpStatus(
        response.status,
        response.error
      );
      this.errorHandler(standardError.message, standardError.code);
    }
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
        severity: ErrorService.getSeverityFromCode(code),
      });
    });
  }, [addError]);

  return apiClient;
};
