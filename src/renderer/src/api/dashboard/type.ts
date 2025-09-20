import { BaseApiQueryParams, OrderParam } from '@/types/query-params'

export interface GetDashboardStatsResponse {
  stats: {
    total_rewards: number
    total_tasks: number
    total_uptime: number
    total_change_amount: number
    total_change_percentage: number
  }
}

export interface GetAllStatsParams {
  start_date: string
  end_date: string
  fill_missing_days?: boolean
}

export interface GetAllStatsResponse {
  stats: {
    date: string
    network: number
    referral: number
  }[]
}

export interface GetBalanceChangeParams {
  period: '1h' | '24h'
  include_history?: boolean
  change_type?:
    | 'all'
    | 'referral'
    | 'proxy'
    | 'uptime'
    | 'daily_task'
    | 'social_task'
    | 'mission'
    | 'other'
    | 'tier_reward'
}

export interface GetBalanceChangeHistory {
  timestamp: string
  balance: string
}

export interface GetBalanceChangeResponse {
  change_amount: string
  change_percentage: string
  history?: GetBalanceChangeHistory[]
}

export interface RecentReward {
  id: string
  date: string
  amount: number
  type: string
}

export interface GetRewardsParams extends BaseApiQueryParams {
  start_date?: string
  end_date?: string
}

export interface GetRewardsResponse {
  items: RecentReward[]
  total: number
}

export interface GetNodeOperatorRewardsResponse {
  data_requests: number
  uptime_hours: number
}

export interface GetReferralRewardsStatsResponse {
  total_rewards: number
  current_tier?: {
    id: string
  } | null
  next_tier: {
    id: string
  } | null
  change_amount: string
  change_percentage: string
}

export enum BalanceChangeType {
  REFERRAL = 'referral',
  PROXY = 'proxy',
  UPTIME = 'uptime',
  DAILY_TASK = 'daily_task',
  SOCIAL_TASK = 'social_task',
  MISSION = 'mission',
  OTHER = 'other',
  TIER_REWARD = 'tier_reward',
}

export interface Log {
  ts: string
  type: BalanceChangeType
  amount: number
}

export interface GetActivityLogParams {
  offset?: number
  limit?: number
  order_by?: OrderParam
  reward_type?: string
}

export interface GetActivityLogResponse {
  items: Log[]
  total: number
}
