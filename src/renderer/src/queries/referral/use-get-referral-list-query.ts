import { GetReferralListParams, referralService } from "@/services/referral";
import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";

export const useGetReferralListQuery = (params: GetReferralListParams) => {
  return useQuery({
    queryKey: ["referrals", params],
    queryFn: () => referralService.getReferralList(params),
    refetchInterval: 60000,
    placeholderData: keepPreviousData,
  });
};

export const useGetReferralListSuspenseQuery = (
  params: GetReferralListParams
) => {
  return useSuspenseQuery({
    queryKey: ["referrals", params],
    queryFn: () => referralService.getReferralList(params),
    refetchInterval: 60000,
  });
};
