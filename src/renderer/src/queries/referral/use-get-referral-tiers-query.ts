import { referralService } from '@/services/referral'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'

const RQUERY_ROOT = 'referral-tiers'
const RQUERY = () => [RQUERY_ROOT]

export const useGetReferralTiersQuery = () => {
  return useQuery({
    queryKey: RQUERY(),
    queryFn: () => referralService.getAllTiers().then((res) => res.data),
    refetchInterval: 60000,
  })
}

export const useGetReferralTiersSuspenseQuery = () => {
  return useSuspenseQuery({
    queryKey: RQUERY(),
    queryFn: () => referralService.getAllTiers().then((res) => res.data),
    refetchInterval: 60000,
  })
}
