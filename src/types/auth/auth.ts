import { AuthUser } from "../user";

export interface AuthCheckResponse {
  isAuthenticated: boolean;
  user: AuthUser;
}

export interface GoogleLoginResponse {
  user: AuthUser;
}
