import Token from '@/components/branding/token'
import { Card, CardContent, CardHeader, CardIcon, CardTitle } from '@/components/ui/card'
import DeltaBadge from '@/components/ui/delta-badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGetMiningStatsQuery } from '@/queries/mining'
import NumberFlow from '@number-flow/react'
import { Sparkle } from 'lucide-react'
import { DeviceInfoCard } from './device-info-card'

export const LeftPanel = () => {
  const { data: stats } = useGetMiningStatsQuery()

  const totalRewards = stats?.total_rewards?.amount || 0
  const percentageChange = stats?.total_rewards?.percentage_change || 0
  const totalCompleted = stats?.total_tasks_completed || stats?.data_points || 0
  const successRate = stats?.success_rate || 0

  const changeAmount = (totalRewards * percentageChange) / 100

  return (
    <div className="bg-background relative h-full w-[420px] flex-shrink-0 border-r border-white/5">
      <ScrollArea className="h-full w-full">
        <div className="space-y-3 p-5">
          {/* Mining Performance Hero */}
          <Card>
            <CardHeader>
              <CardTitle>Total Rewards</CardTitle>
              <CardIcon>
                <Sparkle className="size-4.5" />
              </CardIcon>
            </CardHeader>
            <CardContent>
              <div className="flex min-h-12 flex-row items-center gap-3">
                <div className="flex items-center gap-2">
                  <Token className="size-8 flex-shrink-0" />
                  <div className="flex h-8 items-center">
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
                </div>
                <DeltaBadge value={changeAmount} percentage={percentageChange} />
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-28 leading-none font-semibold text-white tabular-nums">
                  <NumberFlow
                    value={totalCompleted}
                    format={{
                      maximumFractionDigits: 0
                    }}
                  />
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-28 leading-none font-semibold text-white tabular-nums">
                  <NumberFlow
                    value={successRate}
                    format={{ minimumFractionDigits: 0, maximumFractionDigits: 1 }}
                  />
                  %
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Device Information */}
          <DeviceInfoCard />
        </div>
      </ScrollArea>
    </div>
  )
}
