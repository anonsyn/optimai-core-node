import { GetMiningAssignmentsParams, miningApi } from '@/api/mining'
import type { MiningAssignmentsResponse } from '@main/node/types'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'
import { miningKeys } from './keys'

interface Options extends GetMiningAssignmentsParams {
  enabled?: boolean
  retry?: boolean
}

export const useGetMiningAssignmentsQuery = (options?: Options) => {
  const lastVersionRef = useRef<string | null>(null)
  const lastSignatureRef = useRef<string | null>(null)
  const queryClient = useQueryClient()
  const params: GetMiningAssignmentsParams = {
    limit: options?.limit ?? 15,
    platforms: options?.platforms,
    statuses: options?.statuses,
    search_query_id: options?.search_query_id,
    offset: options?.offset,
    created_after: options?.created_after,
    sort_by: options?.sort_by,
    sort_order: options?.sort_order,
    device_id: options?.device_id
  }

  const paramsKey = useMemo(
    () =>
      JSON.stringify({
        limit: params.limit,
        platforms: params.platforms ?? null,
        statuses: params.statuses ?? null,
        search_query_id: params.search_query_id ?? null,
        offset: params.offset ?? null,
        created_after: params.created_after ?? null,
        sort_by: params.sort_by ?? null,
        sort_order: params.sort_order ?? null,
        device_id: params.device_id ?? null
      }),
    [
      params.limit,
      params.platforms ? JSON.stringify(params.platforms) : null,
      params.statuses ? JSON.stringify(params.statuses) : null,
      params.search_query_id,
      params.offset,
      params.created_after,
      params.sort_by,
      params.sort_order,
      params.device_id
    ]
  )

  useEffect(() => {
    lastVersionRef.current = null
    lastSignatureRef.current = null
  }, [paramsKey])

  return useQuery({
    queryKey: miningKeys.assignments(params),
    queryFn: async () => {
      let cacheVersion: string | null = null
      let paramsSignature: string | null = null

      try {
        const versionResponse = await miningApi.getAssignmentsVersion(params)
        cacheVersion = versionResponse.data?.cacheVersion ?? null
        paramsSignature = versionResponse.data?.paramsSignature ?? null
      } catch {
        // If the version endpoint fails, fall back to the full fetch.
      }

      if (
        cacheVersion &&
        paramsSignature &&
        cacheVersion === lastVersionRef.current &&
        paramsSignature === lastSignatureRef.current
      ) {
        const cached = queryClient.getQueryData<MiningAssignmentsResponse>(
          miningKeys.assignments(params)
        )
        if (cached) {
          return cached
        }
      }

      const { data } = await miningApi.getAssignments(params)
      lastVersionRef.current = cacheVersion
      lastSignatureRef.current = paramsSignature
      return data
    },
    refetchInterval: 60_000 * 5, // Refresh every 5 minutes
    staleTime: 1000 * 10, // Consider data stale after 5 seconds
    retry: options?.retry ?? false,
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData
  })
}
