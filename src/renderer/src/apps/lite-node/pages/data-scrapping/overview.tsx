import Token from '@/components/branding/token'
import AnimatedNumber from '@/components/ui/animated-number'
import { Badge } from '@/components/ui/badge'
import { Card, CardTitle } from '@/components/ui/card'
import { StatsMeasure, StatsUnit, StatsValue } from '@/components/ui/measure'
import { useGetProxyStatsQuery } from '@/queries/proxy/use-get-proxy-stats-query'
import { formatNumber } from '@/utils/number'
import NumberFlow from '@number-flow/react'

const Overview = () => {
  const { data } = useGetProxyStatsQuery()
  const stats = data?.stats

  const totalRewards = stats?.total_points
  const totalRequests = stats?.total_tasks || 0
  const throughput = stats?.throughput || 0
  const totalChangeAmount = stats?.total_change_amount || 0

  return (
    <div className="container">
      <div className="relative pt-15">
        <Card className="hlg:px-4 absolute top-0 left-0 w-full -translate-y-1/2 space-y-2 rounded-xl bg-[#222623] px-3 py-3 backdrop-blur-none">
          <CardTitle className="text-16 leading-30">Data Scrapping Rewards</CardTitle>
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
        <div className="flex w-full items-stretch gap-3">
          <Card className="hlg:px-4 flex flex-1 flex-col justify-between gap-2 rounded-xl bg-[#232826] px-3 py-3 backdrop-blur-none">
            <CardTitle className="text-16 leading-30">Total Requests</CardTitle>
            <StatsMeasure className="h-9 items-center gap-1">
              <StatsValue className="text-24 leading-none tabular-nums">
                <NumberFlow
                  value={totalRequests}
                  trend="increasing"
                  locales="en-US"
                  format={{
                    maximumFractionDigits: 0
                  }}
                />
              </StatsValue>
              <StatsUnit className="translate-y-1">Reqs</StatsUnit>
            </StatsMeasure>
          </Card>
          <Card className="hlg:px-4 flex flex-1 flex-col justify-between gap-2 rounded-xl bg-[#232826] px-3 py-3 backdrop-blur-none">
            <CardTitle className="text-16 leading-30">Data Traffic</CardTitle>
            <StatsMeasure className="h-9 items-center gap-1">
              <StatsValue className="text-24 leading-none tabular-nums">
                <NumberFlow
                  value={throughput}
                  trend="increasing"
                  locales="en-US"
                  format={{
                    notation: 'compact',
                    compactDisplay: 'short',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 3
                  }}
                />
              </StatsValue>
              <StatsUnit className="translate-y-1">Mbps</StatsUnit>
            </StatsMeasure>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Overview
