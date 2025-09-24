import { minerClient } from '../../libs/axios'
import type {
  MiningAssignment,
  MiningAssignmentsResponse,
  MiningStatsResponse,
  WorkerPreferences
} from '../../node/types'
import type {
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
    return minerClient.post<StartAssignmentResponse>(
      `/mining/assignments/${assignmentId}/start`,
      {}
    )
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
  },

  setWorkerPreferences(platforms: string[]) {
    return minerClient.put('/workers/preferences', {
      platforms
    })
  },

  sendHeartbeat(agentInfo: Record<string, unknown>) {
    return minerClient.post('/workers/heartbeat', {
      agent_info: agentInfo
    })
  },

  getEventsUrl(): string | null {
    const baseURL = minerClient.defaults.baseURL
    if (!baseURL) {
      return null
    }

    return new URL('/workers/events', baseURL).toString()
  }
}

export type {
  MiningAssignment,
  MiningAssignmentsResponse,
  MiningStatsResponse,
  WorkerPreferences
} from '../../node/types'
export * from './type'
