export interface GoogleLoginResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
  message?: string;
  isAuthenticated: boolean;
}

export interface AuthCheckResponse {
  isAuthenticated: boolean;
  user?: AuthUser;
  expiresAt?: string;
}

export interface UserInfoRequest {
  appKey: string;
  appSecret: string;
  accountNumber: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
  webSocketToken?: string;
  kisToken?: {
    accessToken: string;
    expiresIn?: string;
  };
  kisAppKey?: string;
  kisAppSecret?: string;
  accountNumber?: string;
}

export enum TokenStatus {
  VALID = "valid",
  MISSING = "missing",
  EXPIRED = "expired",
  INVALID = "invalid",
}

export interface LoginResult {
  success: boolean;
  redirectTo?: string;
  user?: AuthUser;
}

export interface TokenData {
  accessToken: string;
  expiresAt: number;
}
