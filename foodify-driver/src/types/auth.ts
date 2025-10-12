export type DriverUser = {
  id: number;
  email: string;
  password?: string;
  authProvider: string;
  name: string;
  enabled: boolean;
  role: string;
  available: boolean;
  phone: string | null;
};

export type LoginResponse = {
  user: DriverUser;
  accessToken: string;
  refreshToken: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type RefreshResponse = AuthTokens;

export type SessionStatusResponse = {
  status: 'active';
};
export interface LogoutRequest {
  refreshToken: string;
}
