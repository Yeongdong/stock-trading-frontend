export interface ApiResponse<T = void> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface ApiOptions {
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  handleError?: boolean;
}

// 페이지네이션을 위한 공통 타입
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 검색 요청을 위한 공통 타입
export interface SearchRequest {
  searchTerm: string;
  page?: number;
  pageSize?: number;
}

// 날짜 범위 조회를 위한 공통 타입
export interface DateRangeRequest {
  startDate: string;
  endDate: string;
}
