// Request/Response types for mining service
// Using the main types from @main/node/types for consistency

export type GetMiningAssignmentsParams = {
  platforms?: string[]
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