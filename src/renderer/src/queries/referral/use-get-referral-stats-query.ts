import { referralService } from '@/services/referral'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'

export const useGetReferralStatsQuery = () => {
  return useQuery({
    queryKey: ['referral-stats'],
    queryFn: () => referralService.getStats().then((res) => res.data),
    refetchInterval: 60000,
  })
}

export const useGetReferralStatsSuspenseQuery = () => {
  return useSuspenseQuery({
    queryKey: ['referral-stats'],
    queryFn: () => referralService.getStats().then((res) => res.data),
    refetchInterval: 60000,
  })
}
