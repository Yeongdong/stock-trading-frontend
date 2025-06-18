export interface GoogleLoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface AuthCheckResponse {
  isAuthenticated: boolean;
  user?: User;
  expiresAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}
