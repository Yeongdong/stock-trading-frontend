import { AuthUser } from "../user";

export interface AuthCheckResponse {
  isAuthenticated: boolean;
  User: AuthUser;
}

export interface GoogleLoginResponse {
  user: AuthUser;
}
