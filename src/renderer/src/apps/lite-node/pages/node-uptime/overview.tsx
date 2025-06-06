import Token from '@/components/branding/token'
import AnimatedNumber from '@/components/ui/animated-number'
import { Badge } from '@/components/ui/badge'
import { Card, CardTitle } from '@/components/ui/card'
import { useGetNodeAvailabilityStatsQuery } from '@/queries/node-avail/use-get-node-avail-stats-query'
import { formatNumber } from '@/utils/format-number'
import NodeUptimeCounter from './node-uptime-counter'

const Overview = () => {
  const { data } = useGetNodeAvailabilityStatsQuery()
  const totalRewards = data?.total_reward
  const totalChangeAmount = data?.total_change_amount || 0

  return (
    <div className="container">
      <div className="relative pt-15">
        <Card className="hlg:px-4 absolute top-0 left-0 w-full -translate-y-1/2 space-y-2 rounded-xl bg-[#222623] px-3 py-3 backdrop-blur-none">
          <CardTitle className="text-16 leading-30">Node Uptime Rewards</CardTitle>
          <div className="flex h-9 items-center gap-3">
            <Token className="size-6" />
            <p className="text-24 text-foreground flex h-8 items-center leading-none font-semibold tabular-nums">
              <AnimatedNumber value={totalRewards} />
            </p>
            {totalChangeAmount > 0 && (
              <Badge className="self-end" variant="up">
                +
                {formatNumber(totalChangeAmount, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                })}
              </Badge>
            )}
          </div>
        </Card>
        <div className="w-full">
          <Card className="] hlg:px-4 flex flex-1 flex-col justify-between rounded-xl bg-[#232826] px-3 py-3 backdrop-blur-none">
            <CardTitle className="text-16 leading-30">Node Uptime</CardTitle>
            <div className="text-22 hlg:text-24 mt-2 leading-normal">
              <NodeUptimeCounter dayLabel="days" labelLeftSpace labelClassName="text-white/50" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Overview
