import axiosClient from '@/libs/axios'
import {
  CheckInResponse,
  ClaimCheckInWeeklyRewardResponse,
  GetCheckInHistoryResponse,
  GetDailyTasksResponse,
  HasClaimedWeeklyRewardResponse
} from './type'

export const dailyTaskService = {
  getDailyTasks() {
    return axiosClient.get<GetDailyTasksResponse>('/daily-tasks')
  },
  checkIn() {
    return axiosClient.post<CheckInResponse>('/daily-tasks/check-in')
  },
  getCheckInHistory() {
    return axiosClient.get<GetCheckInHistoryResponse>('/daily-tasks/check-in-history')
  },
  claimCheckInWeeklyReward() {
    return axiosClient.post<ClaimCheckInWeeklyRewardResponse>(
      '/daily-tasks/claim-checkin-weekly-reward'
    )
  },
  hasClaimedCheckInWeeklyReward() {
    return axiosClient.get<HasClaimedWeeklyRewardResponse>('/daily-tasks/has-claimed-weekly-reward')
  }
}

export * from './type'
