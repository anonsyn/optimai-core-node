export type GetMiningAssignmentsParams = {
  platforms?: string[] | string
  search_query_id?: string
  limit?: number
  offset?: number
  statuses?: string[]
  created_after?: string
}

export type StartAssignmentResponse = {
  success: boolean
  message?: string
}

export type SubmitAssignmentRequest = {
  content?: string
  metadata?: Record<string, any>
  tweets?: Array<{
    url: string
    text: string
    username: string
    timestamp: string
    id?: string
  }>
}

export type SubmitAssignmentResponse = {
  success: boolean
  message?: string
}

export enum MiningAssignmentFailureReason {
  USER_CANCELLED = 'user_cancelled',
  LINK_INVALID = 'link_invalid',
  SITE_DOWN = 'site_down',
  SITE_BLOCKED = 'site_blocked',
  CONTENT_REMOVED = 'content_removed'
}

export type AbandonAssignmentRequest = {
  reason: MiningAssignmentFailureReason
  details?: string
}

export type AbandonAssignmentResponse = {
  ok: boolean
  message?: string
}
