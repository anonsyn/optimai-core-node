import { statsApi } from '@/api/stats'
import { useQuery } from '@tanstack/react-query'
import { statsKeys } from './keys'

export interface UseGetTopCountriesOptions {
  limit?: number // Number of countries to fetch (default: 50)
  no_cache?: boolean
  enabled?: boolean
  staleTime?: number
  refetchInterval?: number
}

export function useGetTopCountries(options: UseGetTopCountriesOptions = {}) {
  const {
    limit = 50, // Default to 50 countries
    no_cache = false,
    enabled = true
  } = options

  const queryKey = statsKeys.topCountries({
    no_cache,
    limit
  })

  return useQuery({
    queryKey,
    queryFn: async () => {
      return statsApi
        .getTopCountries({
          no_cache,
          limit
        })
        .then((res) => res.data)
    },
    enabled,
    refetchInterval: false
  })
}
