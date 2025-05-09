export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    kisToken?: {
      id: number;
      accessToken: string;
      expiresIn: string;
      tokenType: string;
    } | null;
  };
}
