import axiosClient from '@/libs/axios'
import type { LogUptimeRequest, LogUptimeResponse } from './type'

export const uptimeService = {
  logUptime(request: LogUptimeRequest) {
    return axiosClient.post<LogUptimeResponse>('/uptime/online', request)
  },
}

export * from './type'
