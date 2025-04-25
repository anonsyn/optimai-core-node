import axiosClient from '@/libs/axios'
import {
  ClaimReferralTierRequest,
  GenerateReferralCodeResponse,
  GetAllTiersResponse,
  GetReferralListParams,
  GetReferralListResponse,
  GetReferralStatsResponse,
} from './type'

export const referralService = {
  getStats() {
    return axiosClient.get<GetReferralStatsResponse>('/referrals/stats')
  },
  getAllTiers() {
    return axiosClient.get<GetAllTiersResponse>('/referrals/tiers')
  },
  getReferralList(params: GetReferralListParams) {
    return axiosClient.get<GetReferralListResponse>('/referrals', { params })
  },
  generateReferralCode() {
    return axiosClient.post<GenerateReferralCodeResponse>('/referrals/code')
  },
  claimReferralTier(request: ClaimReferralTierRequest) {
    return axiosClient.post('/referrals/claim-tier', request)
  },
}

export * from './type'
