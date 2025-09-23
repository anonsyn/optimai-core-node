// Request/Response types for mining service
// Using the main types from @main/node/types for consistency

export type GetMiningAssignmentsParams = {
  platforms?: string[]
  search_query_id?: string
  limit?: number
  offset?: number
  statuses?: string[]
  created_after?: string
  sort_by?: 'created_at' | 'updated_at' | 'started_at' | 'completed_at'
  sort_order?: 'asc' | 'desc'
}
