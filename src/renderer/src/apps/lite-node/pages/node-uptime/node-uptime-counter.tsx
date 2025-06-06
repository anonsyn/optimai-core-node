import { useGetDashboardStatsQuery } from '@/queries/dashboard/use-get-dashboard-stats-query'
import NumberFlow from '@number-flow/react'
import { intervalToDuration } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'

interface NodeUptimeCounterProps {
  dayLabel?: string
  hourLabel?: string
  minuteLabel?: string
  secondLabel?: string
  labelRightSpace?: boolean
  labelLeftSpace?: boolean
  labelClassName?: string
}

const NodeUptimeCounter = ({
  dayLabel = 'd',
  hourLabel = 'hrs',
  minuteLabel = 'min',
  secondLabel = 's',
  labelLeftSpace,
  labelRightSpace = true,
  labelClassName
}: NodeUptimeCounterProps) => {
  const [uptime, setUptime] = useState<number>()
  const { data: dashboardStats } = useGetDashboardStatsQuery()
  const serverUptime = dashboardStats?.stats.total_uptime || 0 // hours

  const formatUptime = (ms: number) => {
    // Convert to days first to cap at days as largest unit
    const totalDays = Math.floor(ms / (1000 * 60 * 60 * 24))
    const remainingMs = ms % (1000 * 60 * 60 * 24)

    // Get duration for remaining time less than a day
    const duration = intervalToDuration({
      start: 0,
      end: remainingMs
    })

    return [
      {
        label: dayLabel,
        value: totalDays
      },
      {
        label: hourLabel,
        value: duration.hours || 0
      },
      {
        label: minuteLabel,
        value: duration.minutes || 0
      },
      {
        label: secondLabel,
        value: duration.seconds || 0
      }
    ]
  }

  const uptimeParts = useMemo(() => {
    return formatUptime(uptime || 0)
  }, [uptime])

  useEffect(() => {
    if (serverUptime) {
      setUptime(serverUptime * 60 * 60 * 1000)
      const interval = setInterval(() => {
        setUptime((prev) => (prev !== undefined ? prev + 1000 : prev))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [serverUptime])

  return (
    <p className="flex items-center leading-none">
      {uptimeParts.map((part, index) => (
        <span key={index} className="flex items-center">
          <span className="flex items-center tabular-nums">
            <span>
              <NumberFlow
                key={`digit1-${part.label}`}
                value={part.value}
                isolate
                trend="increasing"
                format={{
                  minimumIntegerDigits: index === 0 ? undefined : 2
                }}
              />
            </span>
          </span>
          {labelLeftSpace && <>&nbsp;</>}
          <span className={labelClassName}>{part.label}</span>
          {labelRightSpace && <>&nbsp;</>}
        </span>
      ))}
    </p>
  )
}

export default NodeUptimeCounter
