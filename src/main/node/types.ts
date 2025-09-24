/**
 * Type definitions for Node API
 */

export enum NodeStatus {
  Idle = 'idle',
  Starting = 'starting',
  Running = 'running',
  Restarting = 'restarting',
  Stopping = 'stopping'
}

export interface ServerStatus {
  isRunning: boolean
  isReady: boolean
  port: number | null
}

export interface NodeStatusResponse {
  status: string
  running: boolean
  last_error: string | null
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
  dockerAvailable: boolean
  crawlerInitialized: boolean
  isProcessing: boolean
  assignmentCount: number
  lastError?: string
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
  metadata?: Record<string, any>
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
    search_query?: string
  }
}

export interface MiningAssignmentsResponse {
  assignments: MiningAssignment[]
  total: number
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
    percentage_change: number
    period: string
  }
  weekly_rank: {
    current: number
    previous: number
  }
  data_points: number
  data_storage: number
  data_distribution: {
    video: number
    text: number
    image: number
    audio: number
  }
}

export interface WebSocketMessage {
  event: string
  data: any
}
