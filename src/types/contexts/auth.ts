import { AuthUser } from "../user/user";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}
