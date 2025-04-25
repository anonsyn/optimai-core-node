import axiosClient from '@/libs/axios'
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
    return axiosClient.get<GetDashboardStatsResponse>('/dashboard/stats')
  },
  getAllStats(params: GetAllStatsParams) {
    return axiosClient.get<GetAllStatsResponse>('/dashboard/all-stats', { params })
  },
  getBalanceChange(params: GetBalanceChangeParams) {
    return axiosClient.get<GetBalanceChangeResponse>('/dashboard/balance-change', { params })
  },
  getRewards(params?: GetRewardsParams) {
    return axiosClient.get<GetRewardsResponse>('/dashboard/rewards', { params })
  },
  getNodeOperatorRewards() {
    return axiosClient.get<GetNodeOperatorRewardsResponse>('/dashboard/node-operator-rewards')
  },
  getReferralRewards() {
    return axiosClient.get<GetReferralRewardsStatsResponse>('/dashboard/referral-rewards-stats')
  },
  getActivityLog(params?: GetActivityLogParams) {
    return axiosClient.get<GetActivityLogResponse>('/dashboard/activity-log', { params })
  },
}

export * from './type'
