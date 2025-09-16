import Token from '@/components/branding/token'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { useGetReferralStatsQuery } from '@/queries/referral'
import { balanceFormatOptions, formatNumber } from '@/utils/number'
import NumberFlow from '@number-flow/react'

const Stats = () => {
  const { data: referralStats } = useGetReferralStatsQuery()

  const level1Referrals = referralStats?.stats.level1_referrals || 0
  const level2Referrals = referralStats?.stats.level2_referrals || 0
  const level3Referrals = referralStats?.stats.level3_referrals || 0
  const level1Points = referralStats?.stats.level1_points || 0
  const level2Points = referralStats?.stats.level2_points || 0
  const level3Points = referralStats?.stats.level3_points || 0

  const totalRewards = referralStats?.stats.total_points || 0

  const levels = [
    {
      name: 'Tier 1',
      percentage: '(10%)',
      userCount: level1Referrals,
      reward: formatNumber(level1Points, balanceFormatOptions)
    },
    {
      name: 'Tier 2',
      percentage: '(5%)',
      userCount: level2Referrals,
      reward: formatNumber(level2Points, balanceFormatOptions)
    },
    {
      name: 'Tier 3',
      percentage: '(2.5%)',
      userCount: level3Referrals,
      reward: formatNumber(level3Points, balanceFormatOptions)
    }
  ]

  return (
    <div className="bg-raydial-05 mb-3 flex w-full flex-col gap-4 rounded-lg border border-[#2C2E29] py-3">
      <div className="flex w-full flex-col gap-2 px-3">
        {levels.map((level, index) => {
          return (
            <div
              key={index}
              className="bg-raydial-10 flex min-h-15 items-center justify-between rounded-lg px-5"
            >
              <div>
                <p className="text-14 text-foreground leading-relaxed font-medium">
                  {level.name} <span className="opacity-50">{level.percentage}</span>
                </p>
                <div className="flex items-center gap-1">
                  <Icon className="size-4.5" icon="Users" />
                  <span className="text-16 block leading-relaxed">{level.userCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-16 leading-none font-normal">{level.reward}</span>
                <Token className="size-6" />
              </div>
            </div>
          )
        })}
      </div>
      <Separator />

      <div className="flex h-13 w-full items-center gap-8">
        <div className="flex flex-1 items-center justify-end">
          <Icon className="animate-pulse duration-[2s]" icon="ChevronRight" />
          <Icon className="animate-pulse delay-100 duration-[2s]" icon="ChevronRight" />
          <Icon className="animate-pulse delay-300 duration-[2s]" icon="ChevronRight" />
        </div>
        <div className="flex flex-col items-center">
          <p className="text-16 leading-relaxed text-white/80">Total Reward</p>
          <div className="flex items-center gap-2">
            <p className="text-16 leading-relaxed font-medium text-white">
              <NumberFlow
                value={totalRewards || 0}
                trend="increasing"
                format={balanceFormatOptions}
              />
            </p>
            <Token className="size-6" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-start">
          <Icon className="animate-pulse duration-[2s]" icon="ChevronLeft" />
          <Icon className="animate-pulse delay-100 duration-[2s]" icon="ChevronLeft" />
          <Icon className="animate-pulse delay-300 duration-[2s]" icon="ChevronLeft" />
        </div>
      </div>
    </div>
  )
}

export default Stats
