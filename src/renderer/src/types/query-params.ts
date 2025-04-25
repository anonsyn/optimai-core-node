export enum OrderParam {
  Desc = 'desc',
  Asc = 'asc',
}

export type BaseApiQueryParams<T = string> = {
  offset?: number
  limit?: number
  sort_by?: T
  order?: OrderParam
}

export enum SearchParams {
  Page = 'page',
  Limit = 'per_page',
  Sort = 'sort_by',
  Order = 'order_by',
}

export type PageParams = {
  [SearchParams.Page]?: string
  [SearchParams.Limit]?: string
  [SearchParams.Sort]?: string
  [SearchParams.Order]?: string
}
