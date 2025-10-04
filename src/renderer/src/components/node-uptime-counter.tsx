import { useGetDashboardStatsQuery } from '@/queries/dashboard/use-get-dashboard-stats-query'
import { cn } from '@/utils/tw'
import NumberFlow from '@number-flow/react'
import { intervalToDuration } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'

interface NodeUptimeCounterProps {
  variant?: 'default' | 'compact' | 'detailed'
  showSeconds?: boolean
  className?: string
}

const NodeUptimeCounter = ({
  variant = 'default',
  showSeconds = false,
  className
}: NodeUptimeCounterProps) => {
  const [uptime, setUptime] = useState<number>()
  const { data: dashboardStats } = useGetDashboardStatsQuery()
  const serverUptime = dashboardStats?.stats.total_uptime || 0 // hours from server

  const formatUptime = (millisec: number) => {
    // Convert to days first to cap at days as largest unit
    const totalDays = Math.floor(millisec / (1000 * 60 * 60 * 24))
    const remainingMs = millisec % (1000 * 60 * 60 * 24)

    // Get duration for remaining time less than a day
    const duration = intervalToDuration({
      start: 0,
      end: remainingMs
    })

    return {
      days: totalDays,
      hours: duration.hours || 0,
      minutes: duration.minutes || 0,
      seconds: duration.seconds || 0
    }
  }

  const uptimeData = useMemo(() => {
    return formatUptime(uptime || 0)
  }, [uptime])

  useEffect(() => {
    if (serverUptime) {
      // Convert hours to milliseconds
      setUptime(serverUptime * 60 * 60 * 1000)

      // Update every second to show live counter
      const interval = setInterval(() => {
        setUptime((prev) => (prev !== undefined ? prev + 1000 : prev))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [serverUptime])

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-baseline gap-1', className)}>
        <span className="text-24 font-bold text-white">
          <NumberFlow value={uptimeData.days} />
        </span>
        <span className="text-12 mr-2 text-white/40">days</span>
        <span className="text-18 font-semibold text-white">
          <NumberFlow value={uptimeData.hours} format={{ minimumIntegerDigits: 2 }} />
        </span>
        <span className="text-12 text-white/40">hrs</span>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('grid grid-cols-3 gap-3', className)}>
        <div className="text-center">
          <div className="text-28 font-bold text-white">
            <NumberFlow value={uptimeData.days} />
          </div>
          <div className="text-11 mt-1 tracking-wider text-white/40 uppercase">Days</div>
        </div>
        <div className="text-center">
          <div className="text-28 font-bold text-white">
            <NumberFlow value={uptimeData.hours} format={{ minimumIntegerDigits: 2 }} />
          </div>
          <div className="text-11 mt-1 tracking-wider text-white/40 uppercase">Hours</div>
        </div>
        <div className="text-center">
          <div className="text-28 font-bold text-white">
            <NumberFlow value={uptimeData.minutes} format={{ minimumIntegerDigits: 2 }} />
          </div>
          <div className="text-11 mt-1 tracking-wider text-white/40 uppercase">Mins</div>
        </div>
      </div>
    )
  }

  // Default variant - clean inline display
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Days */}
      <div className="flex items-baseline">
        <span className="text-22 font-bold text-white tabular-nums">
          <NumberFlow value={uptimeData.days} />
        </span>
        <span className="text-12 mr-2 ml-0.5 text-white/50">d</span>
      </div>

      {/* Hours */}
      <div className="flex items-baseline">
        <span className="text-22 font-bold text-white tabular-nums">
          <NumberFlow value={uptimeData.hours} format={{ minimumIntegerDigits: 2 }} />
        </span>
        <span className="text-12 mr-2 ml-0.5 text-white/50">h</span>
      </div>

      {/* Minutes */}
      <div className="flex items-baseline">
        <span className="text-22 font-bold text-white tabular-nums">
          <NumberFlow value={uptimeData.minutes} format={{ minimumIntegerDigits: 2 }} />
        </span>
        <span className="text-12 ml-0.5 text-white/50">m</span>
      </div>

      {/* Seconds (optional) */}
      {showSeconds && (
        <div className="ml-2 flex items-baseline">
          <span className="text-22 font-bold text-white tabular-nums">
            <NumberFlow value={uptimeData.seconds} format={{ minimumIntegerDigits: 2 }} />
          </span>
          <span className="text-12 ml-0.5 text-white/50">s</span>
        </div>
      )}
    </div>
  )
}

export default NodeUptimeCounter
