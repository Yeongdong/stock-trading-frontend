export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiOptions {
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  handleError?: boolean;
}
