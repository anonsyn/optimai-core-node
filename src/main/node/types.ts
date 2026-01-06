/**
 * Type definitions for Node API
 */

import type { AppError } from '../errors/error-codes'

export interface ServerStatus {
  isRunning: boolean
  isReady: boolean
  port: number | null
}

export interface TokensResponse {
  access_token: string | null
  refresh_token: string | null
}

export interface UserResponse {
  id: string
  email: string
  [key: string]: any
}

export interface UptimeProgressResponse {
  uptime: number
  created_at: number
  updated_at: number
  refresh_at: number
  percentage: number
  is_expired: boolean
}

export interface RewardResponse {
  reward: {
    amount: string
    timestamp: number
  } | null
}

// Mining types
export enum MiningStatus {
  Idle = 'idle',
  Initializing = 'initializing',
  InitializingCrawler = 'initializing_crawler',
  Ready = 'ready',
  Processing = 'processing',
  Error = 'error',
  Stopped = 'stopped'
}

export interface MiningWorkerStatus {
  status: MiningStatus
  isProcessing: boolean
  assignmentCount: number
  lastError?: AppError
}

export interface MiningAssignment {
  id: string
  status: 'not_started' | 'in_progress' | 'completed' | 'failed'
  started_at?: string | null
  completed_at?: string | null
  failed_at?: string | null
  failure_reason?: string | null
  failure_reason_expires_at?: string | null
  created_at?: string
  updated_at?: string
  metadata?: {
    url?: string
    title?: string
    timestamp?: string
    description?: string
    favicon?: string
    platform?: string
    author?: string | null
    keywords?: string | null
    preview_image?: string
    'og:image'?: string
    'og:title'?: string
    'og:site_name'?: string
    [key: string]: any
  }
  task: {
    id: string
    platform: 'google' | 'twitter'
    source_url?: string
    status: string
    reward_amount?: number
    metadata: {
      title?: string
      snippet?: string
      query?: string
    }
    created_at?: string
    search_query?: string | null
    search_query_id?: string | null
  }
  result?: {
    id: string
    content: string // The actual scraped content (markdown or JSON)
    data_type: string
    storage_size: number
    metadata: any
    created_at: string
    updated_at: string
  }
}

export interface MiningAssignmentsResponse {
  assignments: MiningAssignment[]
  total: number
}

export interface MiningAssignmentsVersionResponse {
  cacheVersion: string | null
  paramsSignature: string
}

export interface WorkerPreferences {
  platforms: string[]
}

export interface PreferencesResponse {
  platforms: string[]
  updated_at?: string
}

export interface MiningStatsResponse {
  total_rewards: {
    amount: number
    change_amount: number
    percentage_change: number
  }
  task_reward: {
    amount: number
    change_amount: number
    percentage_change: number
  }
  uptime_reward: {
    amount: number
    change_amount: number
    percentage_change: number
  }
  weekly_rank: {
    current: number
    previous: number
  }
}

export interface WebSocketMessage {
  event: string
  data: any
}

export interface LocalDeviceInfo {
  device_id: string | undefined
  ip_address: string
  country: string
  country_code: string
  cpu_cores: number
  memory_gb: number
  os_name: string
  os_version: string
  latitude?: number
  longitude?: number
  name?: string
}
