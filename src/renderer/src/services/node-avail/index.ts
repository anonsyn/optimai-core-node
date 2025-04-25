import axiosClient from '@/libs/axios'
import {
  GetNodeAvailabilityStatsResponse,
  GetNodeRewardsParams,
  GetNodeRewardsResponse,
  GetNodeStatsParams,
  GetNodeStatsResponse,
  GetUserNodesResponse,
} from './type'

export const nodeAvailService = {
  getStats() {
    return axiosClient.get<GetNodeAvailabilityStatsResponse>('/node-avail/stats')
  },
  getUserNodes() {
    return axiosClient.get<GetUserNodesResponse>('/node-avail/nodes')
  },
  getNodeStats(nodeId: string, params: GetNodeStatsParams) {
    return axiosClient.get<GetNodeStatsResponse>(`/node-avail/nodes/${nodeId}`, {
      params,
    })
  },
  getNodeRewards(params?: GetNodeRewardsParams) {
    return axiosClient.get<GetNodeRewardsResponse>(`/node-avail/ips/rewards`, {
      params,
    })
  },
}

export * from './type'
