import { apiClient } from '@/libs/axios'
import {
  CheckInResponse,
  ClaimCheckInWeeklyRewardResponse,
  GetCheckInHistoryResponse,
  GetDailyTasksResponse,
  HasClaimedWeeklyRewardResponse
} from './type'

export const dailyTaskService = {
  getDailyTasks() {
    return apiClient.get<GetDailyTasksResponse>('/daily-tasks')
  },
  checkIn() {
    return apiClient.post<CheckInResponse>('/daily-tasks/check-in')
  },
  getCheckInHistory() {
    return apiClient.get<GetCheckInHistoryResponse>('/daily-tasks/check-in-history')
  },
  claimCheckInWeeklyReward() {
    return apiClient.post<ClaimCheckInWeeklyRewardResponse>(
      '/daily-tasks/claim-checkin-weekly-reward'
    )
  },
  hasClaimedCheckInWeeklyReward() {
    return apiClient.get<HasClaimedWeeklyRewardResponse>('/daily-tasks/has-claimed-weekly-reward')
  }
}

export * from './type'
