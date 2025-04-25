import { BaseApiQueryParams } from '@/types/query-params'

export interface GetProxyStatsResponse {
  stats: {
    total_points: number
    total_tasks: number
    throughput: number
    error_rate: number
    avg_latency: number
    total_change_amount: number
    total_change_percentage: number
  }
}

export interface GetProxyRequestsParams {
  start_date?: string
  end_date?: string
}

export interface ProxyNetwork {
  ip: string
  country_name: string
  country_code2: string
  total_rewards: number
  total_uptime: number
}

export interface ProxyRequestStats {
  date: string
  total_tasks: number
  total_errors: number
}

export interface GetProxyRequestsResponse {
  stats: ProxyRequestStats[]
}

export interface GetProxyNetworkParams extends BaseApiQueryParams {}

export interface GetProxyNetworksResponse {
  items: ProxyNetwork[]
}

export type AssignmentStatus = 'not_started' | 'in_progress' | 'completed' | 'failed'

export interface Assignment {
  id: string
  title: string
  description: string
  proxy_url: string
  proxy_headers?: Record<string, string>
  status: AssignmentStatus
  reward: number
  created_at: string
  updated_at: string
}

export interface GetAssignmentsParams extends BaseApiQueryParams {
  status?: AssignmentStatus | AssignmentStatus[]
  user_ip_id?: string
}

export interface GetAssignmentsResponse {
  items: Assignment[]
  total: number
}

export interface GetAssignmentByIdResponse {
  task: Assignment
}

export interface UpdateAssignmentStatusRequest {
  status: 'in_progress' | 'failed'
}

export type SubmitAssignmentRequest =
  | {
      result: string
      duration_ms: number
    }
  | {
      error: string
      duration_ms: number
    }

export interface ProxyReward {
  task_id: string
  timestamp: string
  amount: string
  proxy_url: string
}

export interface GetProxyRewardsParams {
  start_date?: string
  end_date?: string
  offset?: number
  limit?: number
  order_by?: string
  sort_by?: string
}

export interface GetProxyRewardsResponse {
  items: ProxyReward[]
  total: number
}
