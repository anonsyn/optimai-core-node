export const NodeEvents = {
  StartNode: 'node:start',
  StopNode: 'node:stop',
  RestartMining: 'node:restart-mining',
  GetStatus: 'node:get-status',
  GetMiningStatus: 'node:get-mining-status',
  GetLocalDeviceInfo: 'node:get-local-device-info',
  CompleteMiningAssignment: 'node:complete-mining-assignment',

  OnNodeStatusChanged: 'node:on-status-changed',
  OnDeviceIdChanged: 'node:on-device-id-changed',
  OnUptimeCycle: 'node:on-uptime-cycle',
  OnUptimeReward: 'node:on-uptime-reward',
  OnMiningAssignments: 'node:on-mining-assignments',
  OnMiningAssignmentStarted: 'node:on-mining-assignment-started',
  OnMiningAssignmentCompleted: 'node:on-mining-assignment-completed',
  OnMiningStatusChanged: 'node:on-mining-status-changed',
  OnNodeError: 'node:on-error',
  OnMiningError: 'node:on-mining-error'
} as const
