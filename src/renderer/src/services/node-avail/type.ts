export interface Node {
  id: string
  device_name: string
  device_type: string
  ip_address: string
  created_at: string
}

export interface NodeStats {
  date: string
  uptime: number
  reward: number
}

export interface GetNodeAvailabilityStatsResponse {
  today_uptime: number
  today_reward: number
  total_uptime: number
  total_reward: number
  total_change_amount: number
  total_change_percentage: number
}

export interface GetUserNodesResponse {
  nodes: Node[]
}

export interface GetNodeStatsParams {
  start_date: string
  end_date?: string
}

export interface GetNodeStatsResponse {
  node_stats: NodeStats[]
}

export interface GetNodeRewardsParams {
  limit?: number
  offset?: number
}

export interface NodeRewardItem {
  id: string
  reward_id: string
  amount: number
  timestamp: string
}

export interface GetNodeRewardsResponse {
  items: NodeRewardItem[]
  total: number
}
