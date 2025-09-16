import Token from '@/components/branding/token'
import { Icon } from '@/components/ui/icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useGetDashboardStatsQuery } from '@/queries/dashboard/use-get-dashboard-stats-query'
import { balanceFormatOptions } from '@/utils/number'
import { cn } from '@/utils/tw'
import NumberFlow from '@number-flow/react'

const DayReward = () => {
  const { data } = useGetDashboardStatsQuery()
  const reward = data?.stats.total_rewards || 0
  const totalChangeAmount = data?.stats.total_change_amount || 0

  const shouldReduceFontSize = reward > 100_000 || totalChangeAmount > 100_000

  return (
    <div className="flex min-h-16 flex-1 flex-col justify-between rounded-md border border-white/2 bg-white/4 px-2 py-1.5">
      <div className="flex w-full items-center justify-between">
        <p className="text-12 font-normal text-white/80">24h Rewards</p>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-white/50 transition-colors hover:text-white">
                <Icon className="size-4" icon="Info" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-background max-w-[200px]" align="end">
              <p className="text-12 text-balance">
                24h rewards from your nodes and network contributions.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-1">
        <Token className="size-4.5 flex-shrink-0" />
        <div className="flex h-6 items-center">
          <p
            className={cn(
              'text-20 leading-none font-semibold text-white',
              shouldReduceFontSize && 'text-18'
            )}
            style={{
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            <NumberFlow
              value={totalChangeAmount || 0}
              trend="increasing"
              format={balanceFormatOptions}
            />
          </p>
        </div>
      </div>
    </div>
  )
}

export default DayReward
