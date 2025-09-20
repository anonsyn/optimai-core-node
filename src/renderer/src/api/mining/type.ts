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
