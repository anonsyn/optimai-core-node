import { apiClient, minerClient } from '@/libs/axios'
import type {
  MiningAssignment,
  MiningAssignmentsResponse,
  MiningStatsResponse,
  WorkerPreferences
} from '@main/node/types'
import type { GetMiningAssignmentsParams } from './type'

export const miningApi = {
  getStats() {
    return apiClient.get<MiningStatsResponse>('/mining/stats')
  },
  getAssignments(params?: GetMiningAssignmentsParams) {
    return minerClient.get<MiningAssignmentsResponse>('/mining/assignments', {
      params
    })
  },
  getAssignmentDetail(assignmentId: string) {
    return minerClient.get<MiningAssignment>(`/mining/assignments/${assignmentId}`)
  },
  getWorkerPreferences() {
    return minerClient.get<WorkerPreferences>('/workers/preferences')
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
