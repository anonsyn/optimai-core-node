import { apiClient, minerClient } from '../../libs/axios'
import type {
  MiningAssignment,
  MiningAssignmentsResponse,
  MiningAssignmentsVersionResponse,
  MiningStatsResponse,
  WorkerPreferences
} from '../../node/types'
import { isAxiosError } from 'axios'
import type {
  AbandonAssignmentRequest,
  AbandonAssignmentResponse,
  GetMiningAssignmentsParams,
  StartAssignmentResponse,
  SubmitAssignmentRequest,
  SubmitAssignmentResponse
} from './types'

const ASSIGNMENTS_RETRY_LIMIT = 2
const ASSIGNMENTS_RETRY_DELAY_MS = 250

const isTransientAssignmentsError = (error: unknown): boolean => {
  if (!isAxiosError(error)) {
    return false
  }
  const message = typeof error.message === 'string' ? error.message.toLowerCase() : ''
  return (
    error.code === 'ECONNRESET' ||
    error.code === 'ECONNABORTED' ||
    message.includes('socket hang up')
  )
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getRetryAfterMs = (headers?: Record<string, unknown>): number | null => {
  if (!headers) {
    return null
  }

  const retryAfter = headers['retry-after']
  if (typeof retryAfter === 'string') {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(seconds * 1000, 60_000)
    }
  }

  const reset = headers['x-ratelimit-reset']
  if (typeof reset === 'string') {
    const seconds = Number(reset)
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.min(seconds * 1000, 60_000)
    }
  }

  return null
}

export const miningApi = {
  getStats() {
    return apiClient.get<MiningStatsResponse>('/mining/stats')
  },

  async getAssignments(params?: GetMiningAssignmentsParams) {
    const baseURL = minerClient.defaults.baseURL

    let attempt = 0
    while (true) {
      try {
        const response = await minerClient.get<MiningAssignmentsResponse>(
          '/mining/assignments',
          {
            params,
            timeout: 15_000,
            validateStatus: (status) => status >= 200 && status < 300
          }
        )

        return response
      } catch (error) {
        if (isAxiosError(error)) {
          const status = error.response?.status
          const path = error.config?.url
          let fullUrl: string | undefined
          if (baseURL && path) {
            try {
              fullUrl = new URL(path, baseURL).toString()
            } catch {
              fullUrl = undefined
            }
          }
          // Helpful when diagnosing localhost/IPv6 vs 127.0.0.1 mismatches.
          // eslint-disable-next-line no-console
          console.warn('[miningApi] getAssignments failed', {
            code: error.code,
            message: error.message,
            status,
            baseURL,
            path,
            fullUrl
          })

          if (status === 429 && attempt < ASSIGNMENTS_RETRY_LIMIT) {
            attempt += 1
            const retryAfterMs = getRetryAfterMs(error.response?.headers as Record<string, unknown>)
            const delayMs = retryAfterMs ?? ASSIGNMENTS_RETRY_DELAY_MS * attempt
            await delay(delayMs)
            continue
          }
        }
        if (attempt < ASSIGNMENTS_RETRY_LIMIT && isTransientAssignmentsError(error)) {
          attempt += 1
          await delay(ASSIGNMENTS_RETRY_DELAY_MS * attempt)
          continue
        }
        throw error
      }
    }
  },
  async getAssignmentsVersion(params?: GetMiningAssignmentsParams) {
    const baseURL = minerClient.defaults.baseURL

    let attempt = 0
    while (true) {
      try {
        const response = await minerClient.get<MiningAssignmentsVersionResponse>(
          '/mining/assignments/version',
          {
            params,
            timeout: 10_000,
            validateStatus: (status) => status >= 200 && status < 300
          }
        )

        return response
      } catch (error) {
        if (isAxiosError(error)) {
          const status = error.response?.status
          const path = error.config?.url
          let fullUrl: string | undefined
          if (baseURL && path) {
            try {
              fullUrl = new URL(path, baseURL).toString()
            } catch {
              fullUrl = undefined
            }
          }
          // eslint-disable-next-line no-console
          console.warn('[miningApi] getAssignmentsVersion failed', {
            code: error.code,
            message: error.message,
            status,
            baseURL,
            path,
            fullUrl
          })

          if (status === 429 && attempt < ASSIGNMENTS_RETRY_LIMIT) {
            attempt += 1
            const retryAfterMs = getRetryAfterMs(error.response?.headers as Record<string, unknown>)
            const delayMs = retryAfterMs ?? ASSIGNMENTS_RETRY_DELAY_MS * attempt
            await delay(delayMs)
            continue
          }
        }
        if (attempt < ASSIGNMENTS_RETRY_LIMIT && isTransientAssignmentsError(error)) {
          attempt += 1
          await delay(ASSIGNMENTS_RETRY_DELAY_MS * attempt)
          continue
        }
        throw error
      }
    }
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

  abandonAssignment(assignmentId: string, request: AbandonAssignmentRequest) {
    return minerClient.post<AbandonAssignmentResponse>(
      `/mining/assignments/${assignmentId}/abandon`,
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

  sendHeartbeat(request: { data: string }) {
    return minerClient.post('/workers/heartbeat', request)
  },

  getEventsUrl(deviceId: string): string | null {
    const baseURL = minerClient.defaults.baseURL
    if (!baseURL) {
      return null
    }

    const url = new URL('/workers/events', baseURL)
    url.searchParams.set('device_id', deviceId)
    return url.toString()
  }
}

export type {
  MiningAssignment,
  MiningAssignmentsResponse,
  MiningStatsResponse,
  WorkerPreferences
} from '../../node/types'
export * from './types'
