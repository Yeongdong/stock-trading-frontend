export interface AuthResponse<T = void> {
  isAuthenticated: boolean;
  user?: T;
  token?: string;
}
