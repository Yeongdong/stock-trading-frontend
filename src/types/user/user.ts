export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  accountNumber: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role?: string;
  kisToken?: {
    id: number;
    accessToken: string;
    expiresIn: string;
    tokenType: string;
  } | null;
  webSocketToken?: string | null;
  kisAppKey?: string | null;
  kisAppSecret?: string | null;
  accountNumber?: string | null;
}
