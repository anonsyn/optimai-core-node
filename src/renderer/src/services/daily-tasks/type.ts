export interface DailyTask {
  id: string
  title: string
  description: string
  reward: number
  status: string
}

export type GetDailyTasksResponse = DailyTask

export interface CheckInResponse {
  message: 'string'
  already_checked_in: boolean
  reward: 0
}

export interface GetCheckInHistoryResponse {
  check_in_history: boolean[]
}

export interface ClaimCheckInWeeklyRewardResponse {
  reward: string
}

export type HasClaimedWeeklyRewardResponse = {
  has_claimed: boolean
  claimed_reward: number
}
