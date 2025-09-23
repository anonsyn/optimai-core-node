export const NodeEvents = {
  StartNode: 'node:start',
  StopNode: 'node:stop',
  GetStatus: 'node:get-status',
  GetMiningStatus: 'node:get-mining-status',
  CompleteMiningAssignment: 'node:complete-mining-assignment',

  OnNodeStatusChanged: 'node:on-status-changed',
  OnUptimeCycle: 'node:on-uptime-cycle',
  OnUptimeReward: 'node:on-uptime-reward',
  OnMiningAssignment: 'node:on-mining-assignment',
  OnMiningAssignmentCompleted: 'node:on-mining-assignment-completed',
  OnMiningStatusChanged: 'node:on-mining-status-changed',
  OnNodeError: 'node:on-error',
  OnMiningError: 'node:on-mining-error'
} as const
