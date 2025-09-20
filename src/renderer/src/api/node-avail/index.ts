import { apiClient } from '@/libs/axios'
import {
  GetNodeAvailabilityStatsResponse,
  GetNodeRewardsParams,
  GetNodeRewardsResponse,
  GetNodeStatsParams,
  GetNodeStatsResponse,
  GetUserNodesResponse
} from './type'

export const nodeAvailApi = {
  getStats() {
    return apiClient.get<GetNodeAvailabilityStatsResponse>('/node-avail/stats')
  },
  getUserNodes() {
    return apiClient.get<GetUserNodesResponse>('/node-avail/nodes')
  },
  getNodeStats(nodeId: string, params: GetNodeStatsParams) {
    return apiClient.get<GetNodeStatsResponse>(`/node-avail/nodes/${nodeId}`, {
      params
    })
  },
  getNodeRewards(params?: GetNodeRewardsParams) {
    return apiClient.get<GetNodeRewardsResponse>(`/node-avail/ips/rewards`, {
      params
    })
  }
}

export * from './type'
