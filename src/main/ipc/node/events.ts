export const NodeEvents = {
  StartNode: 'node:start-node-command',
  StopNode: 'node:stop-node-command',
  GetNodeStatus: 'node:get-node-status',
  GetNodeServerUrl: 'node:get-node-server-url',
  OnNodeStatusChanged: 'node:on-node-status-changed'
} as const
