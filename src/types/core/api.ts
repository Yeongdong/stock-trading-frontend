export interface ApiResult<T = void> {
  readonly data?: T;
  readonly error?: string;
  readonly status: number;
}

export interface ApiOptions {
  readonly headers?: Record<string, string>;
  readonly requiresAuth?: boolean;
  readonly handleError?: boolean;
  readonly priority?: "low" | "normal" | "high";
  readonly maxRetries?: number;
  readonly timeout?: number;
}

export interface PaginatedRequest {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface PaginatedResult<T> {
  readonly items: T[];
  readonly totalCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

export interface SearchRequest extends PaginatedRequest {
  readonly searchTerm: string;
}

export interface DateRangeRequest {
  readonly startDate: string;
  readonly endDate: string;
}
