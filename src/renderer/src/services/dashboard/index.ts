import { apiClient } from '@/libs/axios'
import {
  GetActivityLogParams,
  GetActivityLogResponse,
  GetAllStatsParams,
  GetAllStatsResponse,
  GetBalanceChangeParams,
  GetBalanceChangeResponse,
  GetDashboardStatsResponse,
  GetNodeOperatorRewardsResponse,
  GetReferralRewardsStatsResponse,
  GetRewardsParams,
  GetRewardsResponse,
} from './type'

export const dashboardService = {
  getDashboardStats() {
    return apiClient.get<GetDashboardStatsResponse>('/dashboard/stats')
  },
  getAllStats(params: GetAllStatsParams) {
    return apiClient.get<GetAllStatsResponse>('/dashboard/all-stats', { params })
  },
  getBalanceChange(params: GetBalanceChangeParams) {
    return apiClient.get<GetBalanceChangeResponse>('/dashboard/balance-change', { params })
  },
  getRewards(params?: GetRewardsParams) {
    return apiClient.get<GetRewardsResponse>('/dashboard/rewards', { params })
  },
  getNodeOperatorRewards() {
    return apiClient.get<GetNodeOperatorRewardsResponse>('/dashboard/node-operator-rewards')
  },
  getReferralRewards() {
    return apiClient.get<GetReferralRewardsStatsResponse>('/dashboard/referral-rewards-stats')
  },
  getActivityLog(params?: GetActivityLogParams) {
    return apiClient.get<GetActivityLogResponse>('/dashboard/activity-log', { params })
  },
}

export * from './type'
