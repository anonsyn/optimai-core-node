/**
 * Type definitions for Node API
 */

export enum NodeStatus {
  Idle = 'idle',
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
export interface MiningAssignment {
  id: string
  status: string
  task: {
    id: string
    platform: string
    source_url?: string
    search_query?: string
    title?: string
    snippet?: string
    reward_amount?: string
    [key: string]: any
  }
  metadata?: Record<string, any>
  started_at?: string
  completed_at?: string
  failed_at?: string
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

export interface WebSocketMessage {
  event: string
  data: any
}
