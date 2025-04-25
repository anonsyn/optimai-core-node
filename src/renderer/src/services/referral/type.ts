import { BaseApiQueryParams } from '@/types/query-params'

export interface ReferralStats {
  total_points: number
  total_referrals: number
  completed_referrals: number
  incomplete_referrals: number
  referral_code: string
  current_tier?: string
  next_tier?: string
  points_to_next_tier: number
  level1_referrals: number
  level2_referrals: number
  level3_referrals: number
  level1_points: number
  level2_points: number
  level3_points: number
  change_amount: number
  change_percentage: number
}

export interface Referral {
  id: string
  email: string
  created_at: string
  completed: boolean
  rewards: number
  username: string | null
  photo_url: string
}

export interface ReferralTier {
  id: string
  name: string
  min_referrals: number
  max_referrals: number
  bonus: number
  claimed: boolean
  tier_order: number
}

export interface GetReferralStatsResponse {
  stats: ReferralStats
}

export interface GenerateReferralCodeResponse {
  code: string
}

export interface GetReferralListParams extends BaseApiQueryParams {
  campaign_id?: string
  platforms?: 'tlg'
}

export interface GetReferralListResponse {
  items: Referral[]
  total: number
}

export interface GetAllTiersResponse {
  tiers: ReferralTier[]
}

export interface ClaimReferralTierRequest {
  tier_order: number
}
