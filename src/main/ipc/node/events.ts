export const NodeEvents = {
  // API Server
  GetServerStatus: 'node:get-server-status',
  GetServerUrl: 'node:get-server-url',
  GetServerPort: 'node:get-server-port',

  // WebSocket
  GetWebSocketStatus: 'node:get-websocket-status',

  // Node Operations
  StartNode: 'node:start',
  StopNode: 'node:stop',
  GetNodeStatus: 'node:get-status',

  // API Calls - Authentication
  LoginApi: 'node:login-api',
  LogoutApi: 'node:logout-api',
  GetUserApi: 'node:get-user-api',
  GetTokensApi: 'node:get-tokens-api',
  RefreshTokenApi: 'node:refresh-token-api',

  // API Calls - Uptime & Rewards
  GetUptimeApi: 'node:get-uptime-api',
  GetRewardApi: 'node:get-reward-api',

  // Events
  OnNodeStatusChanged: 'node:on-status-changed'
} as const
