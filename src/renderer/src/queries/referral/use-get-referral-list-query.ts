import { GetReferralListParams, referralApi } from '@/api/referral'
import { keepPreviousData, useQuery, useSuspenseQuery } from '@tanstack/react-query'

export const useGetReferralListQuery = (params: GetReferralListParams) => {
  return useQuery({
    queryKey: ['referrals', params],
    queryFn: () => referralApi.getReferralList(params),
    refetchInterval: 60000,
    placeholderData: keepPreviousData
  })
}

export const useGetReferralListSuspenseQuery = (params: GetReferralListParams) => {
  return useSuspenseQuery({
    queryKey: ['referrals', params],
    queryFn: () => referralApi.getReferralList(params),
    refetchInterval: 60000
  })
}
