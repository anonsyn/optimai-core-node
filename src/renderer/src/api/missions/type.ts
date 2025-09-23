export interface GetStatsResponse {
  completed_tasks: number
  total_tasks: number
  total_rewards: string
  change_amount: string
  change_percentage: string
}

export enum TaskStatus {
  NOT_STARTED = 'not_started',
  VERIFYING = 'verifying',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum MissionType {
  NETWORK = 'network',
  ENGAGEMENT = 'engagement',
  COMMUNITY = 'community'
}

export enum TaskAction {
  CONNECT = 'connect',
  FOLLOW = 'follow',
  JOIN = 'join',
  LIKE = 'like',
  REACT = 'react',
  RETWEET = 'retweet',
  TWEET = 'tweet',
  COMMENT = 'comment',
  QUOTE = 'quote',
  VISIT = 'visit'
}

// Common base type for all missions
interface BaseMission {
  id: string
  title: string
  description: string
  reward: string
  action: TaskAction | string
  action_url?: string | null
  status: TaskStatus
  started_at: string
  completed_at: string
  failure_reason?: string | null
}

export interface NetworkMission extends BaseMission {
  task_type: string
  metadata?: {
    [key: string]: any
  }
}

// Second type: Network Tasks
export interface EngagementMission extends BaseMission {
  platform: string
}

export interface CommunityMission extends BaseMission {
  platform: string
}

// Union type for all mission types
export type Mission = NetworkMission | EngagementMission | CommunityMission

export interface GetNetworkMissionsResponse extends Array<NetworkMission> {}

export interface GetEngagementMissionsResponse extends Array<EngagementMission> {}

export interface VerifyEngagementMissionRequest {
  tweet_url?: string
  review_url?: string
}

export interface GetCommunityMissionsResponse extends Array<CommunityMission> {}

export interface GetDashboardMissionsResponse {
  items: Mission[]
  total: number
}
