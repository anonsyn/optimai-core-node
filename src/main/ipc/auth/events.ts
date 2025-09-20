export const AuthEvents = {
  // Token Operations
  Login: 'auth:login',
  GetAccessToken: 'auth:get-access-token',
  GetRefreshToken: 'auth:get-refresh-token',
  UpdateAccessToken: 'auth:update-access-token',
  UpdateRefreshToken: 'auth:update-refresh-token',
  Logout: 'auth:logout',
  HasTokens: 'auth:has-tokens'
} as const