import Signal from '@/components/ui/signal'
import { useAppSelector } from '@/hooks/redux'
import { useGetNodeOperatorRewardsQuery } from '@/queries/dashboard/use-get-node-operator-rewards-query'
import { onlineSelectors } from '@/store/slices/online'
import { compactNumber } from '@/utils/number'
import { cn } from '@/utils/tw'

const Uptime = () => {
  const {
    data = {
      data_requests: 0,
      uptime_hours: 0
    },
    isPending
  } = useGetNodeOperatorRewardsQuery()

  const { uptime_hours } = data

  const uptime = compactNumber(uptime_hours, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

  const isOnline = useAppSelector(onlineSelectors.isOnline)

  return (
    <div className="flex h-9 items-center justify-between rounded-md border border-white/2 bg-white/4 px-2">
      <p className="text-12 leading-normal font-normal text-white/80">
        <span>Node Uptime: </span>
        <span className="font-semibold text-white">{uptime} Hours</span>
      </p>
      <div className="flex items-center gap-2">
        <Signal className="size-3" variant={isOnline ? 'positive' : 'negative'} />
        <span
          className={cn(
            'text-12 text-positive leading-none font-normal',
            isPending && 'text-white/80',
            !isOnline && 'text-destructive'
          )}
        >
          {isOnline ? (isPending ? 'Connecting' : 'Connected') : 'Disconnected'}
        </span>
      </div>
    </div>
  )
}

export default Uptime
