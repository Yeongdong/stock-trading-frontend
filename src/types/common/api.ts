// API 공통 응답 구조
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

// API 요청 옵션
export interface ApiOptions {
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  handleError?: boolean;
  priority?: RequestPriority;
  maxRetries?: number;
  timeout?: number;
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  results: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export enum RequestPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4, // 실시간 주문
}

export interface ApiPriorityRule {
  readonly pattern: RegExp;
  readonly methods: string[];
  readonly priority: RequestPriority;
  readonly description: string;
}
