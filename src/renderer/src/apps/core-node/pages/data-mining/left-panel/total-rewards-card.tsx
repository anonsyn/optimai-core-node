import Token from '@/components/branding/token'
import { Card, CardIcon, CardTitle } from '@/components/ui/card'
import DeltaBadge from '@/components/ui/delta-badge'
import { useGetMiningStatsQuery } from '@/queries/mining'
import NumberFlow from '@number-flow/react'
import { Sparkle } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { DeviceDetail } from '@main/api/device/types'
import { WorldMap } from './world-map'

export const TotalRewardsCard = () => {
  const { data: stats } = useGetMiningStatsQuery()
  const [deviceDetail, setDeviceDetail] = useState<DeviceDetail | null>(null)

  useEffect(() => {
    window.nodeIPC.getDeviceDetails()
      .then((detail) => {
        console.log('TotalRewardsCard - Device details fetched:', detail)
        setDeviceDetail(detail)
      })
      .catch((error) => {
        console.error('TotalRewardsCard - Failed to fetch device details:', error)
      })
  }, [])

  // Total Rewards
  const totalRewards = stats?.total_rewards?.amount || 0
  const totalChangeAmount = stats?.total_rewards?.change_amount || 0
  const totalPercentageChange = stats?.total_rewards?.percentage_change || 0

  // Task Reward
  const taskReward = stats?.task_reward?.amount || 0
  const taskChangeAmount = stats?.task_reward?.change_amount || 0
  const taskPercentageChange = stats?.task_reward?.percentage_change || 0

  // Uptime Reward
  const uptimeReward = stats?.uptime_reward?.amount || 0
  const uptimeChangeAmount = stats?.uptime_reward?.change_amount || 0
  const uptimePercentageChange = stats?.uptime_reward?.percentage_change || 0

  return (
    <Card className="overflow-hidden">
      {/* World Map Section */}
      <div className="border-b border-white/5">
        <WorldMap latitude={deviceDetail?.latitude} longitude={deviceDetail?.longitude} />
      </div>

      {/* Total Rewards Header and Stats */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-base">Total Rewards</CardTitle>
          <CardIcon>
            <Sparkle className="size-4.5" />
          </CardIcon>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Token className="size-8 flex-shrink-0" />
            <span className="text-28 leading-none font-semibold text-white tabular-nums">
              <NumberFlow
                value={totalRewards}
                format={{
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }}
              />
            </span>
          </div>
          <DeltaBadge value={totalChangeAmount} percentage={totalPercentageChange} />
        </div>
      </div>

      {/* Reward Breakdown - Two Columns */}
      <div className="flex divide-x divide-white/5 border-t border-white/5">
        {/* Task Reward */}
        <div className="flex-1 px-5 py-4">
          <p className="text-xs text-white/50 mb-3">Task Reward</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Token className="size-[18px] flex-shrink-0" />
              <span className="text-xl font-medium text-white tabular-nums">
                <NumberFlow
                  value={taskReward}
                  format={{
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }}
                />
              </span>
            </div>
            <DeltaBadge value={taskChangeAmount} percentage={taskPercentageChange} />
          </div>
        </div>

        {/* Uptime Reward */}
        <div className="flex-1 px-5 py-4">
          <p className="text-xs text-white/50 mb-3">Uptime Reward</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Token className="size-[18px] flex-shrink-0" />
              <span className="text-xl font-medium text-white tabular-nums">
                <NumberFlow
                  value={uptimeReward}
                  format={{
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }}
                />
              </span>
            </div>
            <DeltaBadge value={uptimeChangeAmount} percentage={uptimePercentageChange} />
          </div>
        </div>
      </div>
    </Card>
  )
}
