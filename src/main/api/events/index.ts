import { apiClient } from '../../libs/axios'
import type { ReportEventRequest, ReportEventResponse } from './types'

export const eventsApi = {
  reportEvent(request: ReportEventRequest) {
    return apiClient.post<ReportEventResponse>('/events', request)
  }
}

export * from './types'
