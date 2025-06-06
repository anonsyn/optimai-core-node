import Token from '@/components/branding/token'
import { definedGradient, getSvgDefs } from '@/components/svgs/defined-gradient'
import { SubmitButton } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { toastError } from '@/components/ui/toast'
import IMAGES from '@/configs/images'
import { RQUERY as MISSIONS_STATS_RQUERY } from '@/queries/missions/use-get-missions-stats-query'
import { useGetReferralStatsQuery } from '@/queries/referral/use-get-referral-stats-query'
import { useGetReferralTiersQuery } from '@/queries/referral/use-get-referral-tiers-query'
import { referralService, ReferralTier } from '@/services/referral'
import { formatNumber } from '@/utils/format-number'
import { getErrorMessage } from '@/utils/get-error-message'
import { cn } from '@/utils/tw'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const tierIcons = [
  IMAGES.TIERS.TIER1,
  IMAGES.TIERS.TIER2,
  IMAGES.TIERS.TIER3,
  IMAGES.TIERS.TIER4,
  IMAGES.TIERS.TIER5
]

const Tiers = () => {
  const { data, isLoading: isTiersLoading, refetch: refetchTiers } = useGetReferralTiersQuery()
  const {
    data: referralStats,
    isLoading: isReferralStatsLoading,
    refetch: refetchReferralStats
  } = useGetReferralStatsQuery()

  const isLoading = isTiersLoading || isReferralStatsLoading

  const tiers = data?.tiers || []
  const referralCount = referralStats?.stats.completed_referrals || 0
  const activeTierId = referralStats?.stats.next_tier || referralStats?.stats.current_tier

  const queryClient = useQueryClient()

  const handleClaimTierSuccess = () => {
    refetchTiers()
    refetchReferralStats()
    queryClient.invalidateQueries({ queryKey: MISSIONS_STATS_RQUERY() })
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-1 xl:gap-8">
      {isLoading ? (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      ) : (
        <>
          {tiers.map((item, index) => {
            return (
              <TierItem
                key={item.id}
                item={item}
                index={index}
                referralCount={referralCount}
                activeTierId={activeTierId}
                onClaimTierSuccess={handleClaimTierSuccess}
              />
            )
          })}
        </>
      )}
    </div>
  )
}

const TierItem = ({
  item,
  index,
  referralCount,
  activeTierId,
  onClaimTierSuccess
}: {
  item: ReferralTier
  index: number
  referralCount: number
  activeTierId?: string
  onClaimTierSuccess: () => void
}) => {
  const icon = tierIcons[item.tier_order % tierIcons.length]
  const isCompleted = referralCount >= item.min_referrals
  const isActive = item.id === activeTierId || isCompleted
  const isClaimed = item.claimed
  const canClaim = isCompleted && !isClaimed

  // Calculate the order for swapping pairs (3-4, 7-8, 11-12, 15-16)
  const pairIndex = Math.floor(index / 2)
  const isSwapPair = pairIndex % 2 === 1
  const isFirstInPair = index % 2 === 0

  let order = index + 1
  if (isSwapPair) {
    order = isFirstInPair ? index + 2 : index
  }

  const { mutateAsync: claimTier, isPending: isClaimingTier } = useMutation({
    mutationFn: () => {
      return referralService.claimReferralTier({ tier_order: item.tier_order })
    }
  })

  const handleClaimTier = async () => {
    try {
      await claimTier()
      onClaimTierSuccess()
    } catch (error) {
      const message = getErrorMessage(error)
      toastError(message)
    }
  }

  return (
    <div
      className={cn('group/item relative', 'md:[order:var(--order)] xl:order-none')}
      style={{ '--order': order } as React.CSSProperties}
    >
      <div
        className={cn(
          'rounded-10 border-secondary/60 bg-secondary/60 relative z-10 space-y-6 border p-3 xl:space-y-12 xl:p-4',
          isActive && 'bg-tier-in-progress border-[#687157]'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2">
            <div className="bg-background/50 flex size-9 items-center justify-center rounded-full backdrop-blur-xl xl:size-13">
              <img
                className="size-5 overflow-hidden rounded-full xl:size-8"
                style={{
                  filter: 'drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.30))'
                }}
                src={icon}
                alt={item.name}
              />
            </div>
            <p className="text-16 xl:text-20 font-semibold">
              Tier {item.tier_order + 1}: {item.name}
            </p>
          </div>

          <>
            {canClaim ? (
              <SubmitButton
                className="text-14 xl:text-16 min-h-9 min-w-30 xl:min-h-11"
                loading={isClaimingTier}
                onClick={handleClaimTier}
              >
                Claim
              </SubmitButton>
            ) : (
              <div className="bg-background/50 flex h-9 min-w-24 items-center justify-center rounded-lg px-3 py-2 2xl:h-11 2xl:min-w-37">
                <span className="text-14 font-normal text-white opacity-50">
                  +{formatNumber(item.bonus || 0)}
                </span>
                <Token className="mr-2 ml-1 size-4.5" />
                {item.claimed ? (
                  <Icon
                    className="size-4.5"
                    icon="Check"
                    stroke={getSvgDefs(definedGradient.mainLinearGradient)}
                  />
                ) : (
                  <Icon className="size-4.5" icon="Lock" />
                )}
              </div>
            )}
          </>
        </div>
        <div className="space-y-2">
          <div className="h-1 w-full overflow-hidden rounded-sm bg-[#5B5B5B]">
            <div
              className="bg-main h-full max-w-full transition-[width] duration-150"
              style={{
                width: `${(referralCount / item.min_referrals) * 100}%`
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-14 md:text-16 leading-relaxed opacity-80">
              Invite {item.min_referrals} friend
              {item.min_referrals > 1 ? 's' : ''}
            </p>
            <p className="text-14 md:text-16 leading-relaxed opacity-80">
              {Math.min(referralCount, item.min_referrals)}/{item.min_referrals}
            </p>
          </div>
        </div>
      </div>
      <div
        className={cn(
          'absolute top-full left-1/2 flex h-5 w-2 origin-center -translate-x-1/2 items-center justify-center px-0.5 opacity-30 group-last/item:hidden xl:h-8',
          index % 4 === 0 &&
            'md:top-1/2 md:left-full md:translate-x-1.5 md:-translate-y-1/2 md:rotate-90 xl:top-full xl:left-1/2 xl:-translate-x-1/2 xl:translate-y-0 xl:rotate-0',
          index % 4 === 2 &&
            'md:top-1/2 md:left-0 md:-translate-x-4 md:-translate-y-1/2 md:rotate-90 xl:top-full xl:left-1/2 xl:-translate-x-1/2 xl:translate-y-0 xl:rotate-0',
          isCompleted && 'opacity-100'
        )}
        style={{
          background:
            'linear-gradient(90deg, rgba(255, 255, 255, 0.50) 0%, rgba(83, 83, 83, 0.10) 45%, rgba(83, 83, 83, 0.10) 55%, rgba(255, 255, 255, 0.50) 100%)'
        }}
      >
        {isCompleted && <div className="bg-main h-full w-full" />}
      </div>
    </div>
  )
}

export default Tiers
