import { dailyTaskService } from '@/services/daily-tasks'
import { useQuery } from '@tanstack/react-query'

export const useGetCheckInHistoryQuery = (
  options: {
    enabled?: boolean
  } = { enabled: true }
) => {
  const { enabled } = options
  return useQuery({
    queryKey: ['check-in-history'],
    queryFn: () =>
      dailyTaskService
        .getCheckInHistory()
        .then((res) => res.data)
        .then((res) => {
          // return {
          //   check_in_history: [true, true, false, true, true, true, true],
          // };
          return res
        }),
    refetchInterval: 60000,
    enabled,
  })
}
