import { apiClient } from '@/libs/axios'
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
    return apiClient.get<GetReferralStatsResponse>('/referrals/stats')
  },
  getAllTiers() {
    return apiClient.get<GetAllTiersResponse>('/referrals/tiers')
  },
  getReferralList(params: GetReferralListParams) {
    return apiClient.get<GetReferralListResponse>('/referrals', { params })
  },
  generateReferralCode() {
    return apiClient.post<GenerateReferralCodeResponse>('/referrals/code')
  },
  claimReferralTier(request: ClaimReferralTierRequest) {
    return apiClient.post('/referrals/claim-tier', request)
  },
}

export * from './type'
