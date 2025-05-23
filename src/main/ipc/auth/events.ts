export const AuthEvents = {
  GetAccessToken: 'auth:get-access-token-command',
  SaveTokens: 'auth:save-tokens-command',
  RefreshToken: 'auth:refresh-token-command',
  Logout: 'auth:logout-command'
} as const
