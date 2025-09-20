import { minerClient } from '@/libs/axios'
import type {
  MiningAssignment,
  MiningAssignmentsResponse,
  MiningStatsResponse,
  WorkerPreferences
} from '@main/node/types'
import {
  GetMiningAssignmentsParams,
  StartAssignmentResponse,
  SubmitAssignmentRequest,
  SubmitAssignmentResponse
} from './type'

export const miningApi = {
  getStats() {
    return minerClient.get<MiningStatsResponse>('/mining/stats')
  },
  getAssignments(params?: GetMiningAssignmentsParams) {
    return minerClient.get<MiningAssignmentsResponse>('/mining/assignments', {
      params
    })
  },
  getAssignmentDetail(assignmentId: string) {
    return minerClient.get<MiningAssignment>(`/mining/assignments/${assignmentId}`)
  },
  startAssignment(assignmentId: string) {
    return minerClient.post<StartAssignmentResponse>(`/mining/assignments/${assignmentId}/start`)
  },
  submitAssignment(assignmentId: string, request: SubmitAssignmentRequest) {
    return minerClient.post<SubmitAssignmentResponse>(
      `/mining/assignments/${assignmentId}/submit`,
      request
    )
  },
  getWorkerPreferences() {
    return minerClient.get<WorkerPreferences>('/workers/preferences')
  },
  updateWorkerPreferences(preferences: WorkerPreferences) {
    return minerClient.put<WorkerPreferences>('/workers/preferences', preferences)
  }
}

export * from './type'
// Re-export types from main for convenience
export type {
  MiningAssignment,
  MiningAssignmentsResponse,
  MiningStatsResponse,
  WorkerPreferences
} from '@main/node/types'