import Token from '@/components/branding/token'
import { Card, CardContent, CardHeader, CardIcon, CardTitle } from '@/components/ui/card'
import DeltaBadge from '@/components/ui/delta-badge'
import { useLocalDeviceInfoQuery } from '@/queries/device/use-local-device-info-query'
import { useGetMiningStatsQuery } from '@/queries/mining'
import NumberFlow from '@number-flow/react'
import { Sparkle } from 'lucide-react'
import { WorldMap } from './world-map'
import { WorldMapLeaflet } from './world-map-leaflet'

const USE_LEAFLET_MAP = true

export const TotalRewardsCard = () => {
  const { data: stats } = useGetMiningStatsQuery()
  const { data: deviceInfo } = useLocalDeviceInfoQuery()

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

  const items = [
    {
      label: 'Task Reward',
      reward: taskReward,
      changeAmount: taskChangeAmount,
      changePercentage: taskPercentageChange
    },
    {
      label: 'Uptime Reward',
      reward: uptimeReward,
      changeAmount: uptimeChangeAmount,
      changePercentage: uptimePercentageChange
    }
  ] as const

  return (
    <Card className="w-full overflow-hidden p-0">
      <div className="border-b border-white/4">
        {USE_LEAFLET_MAP ? (
          <WorldMapLeaflet
            key={Date.now()}
            latitude={deviceInfo?.latitude || null}
            longitude={deviceInfo?.longitude || null}
          />
        ) : (
          <WorldMap
            latitude={deviceInfo?.latitude || null}
            longitude={deviceInfo?.longitude || null}
          />
        )}
      </div>

      <div className="px-4 py-3">
        <CardHeader>
          <CardTitle>Total Rewards</CardTitle>
          <CardIcon>
            <Sparkle className="size-4.5" />
          </CardIcon>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
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
            <DeltaBadge
              className="whitespace-nowrap"
              value={totalChangeAmount}
              percentage={totalPercentageChange}
            />
          </div>
        </CardContent>
      </div>

      <div className="flex divide-x divide-white/4 border-t border-white/4">
        {items.map((item, index) => {
          return (
            <div key={index} className="flex-1 py-4 pr-4 pl-5">
              <p className="text-14 leading-normal text-white/50">{item.label}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <Token className="size-4.5 flex-shrink-0" />
                  <span className="text-20 leading-tight font-medium text-white tabular-nums">
                    <NumberFlow
                      value={item.reward}
                      format={{
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }}
                    />
                  </span>
                </div>
                <DeltaBadge
                  className="text-14 mt-1 leading-normal whitespace-nowrap"
                  value={item.changeAmount}
                  options={{
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 2
                  }}
                  text
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
