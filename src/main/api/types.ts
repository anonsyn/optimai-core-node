export type BaseApiQueryParams<T = string> = {
  offset?: number
  limit?: number
  sort_by?: T
  order?: 'asc' | 'desc'
}
