import { GetNodeRewardsParams, GetNodeStatsParams } from '@/api/node-avail'

export const nodeAvailKeys = {
  stats: () => ['node-avail-stats'] as const,
  nodeStats: (userIpId: string | undefined, params: GetNodeStatsParams) =>
    ['node-avail-node-stats', userIpId, params] as const,
  nodeRewards: (params?: GetNodeRewardsParams) => ['node-avail-node-rewards', params] as const,
  userNodes: () => ['node-avail-user-nodes'] as const
}
