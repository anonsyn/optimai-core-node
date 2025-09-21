import { apiClient } from '../../libs/axios'
import type { RewardResponse, UptimeProgressResponse } from '../../node/types'

interface ReportUptimeResponse {
  data: string
}

export const uptimeApi = {
  reportOnline(encodedData: string) {
    return apiClient.post<ReportUptimeResponse>('/uptime/online', {
      data: encodedData
    })
  },

  getProgress() {
    return apiClient.get<UptimeProgressResponse>('/uptime/progress')
  },

  getLatestReward() {
    return apiClient.get<RewardResponse>('/uptime/latest_reward')
  }
}
