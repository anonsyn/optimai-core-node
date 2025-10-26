import { apiClient } from '../../libs/axios'
import type {
  CompleteReportBody,
  CompleteReportResponse,
  CreateReportBody,
  CreateReportResponse
} from './types'

export const reportsApi = {
  createReport(payload: CreateReportBody) {
    return apiClient.post<CreateReportResponse>('reports', payload)
  },

  completeReport(reportId: string, payload: CompleteReportBody) {
    return apiClient.patch<CompleteReportResponse>(`reports/${reportId}/complete`, payload)
  }
}

export type { CompleteReportBody, CreateReportBody }
