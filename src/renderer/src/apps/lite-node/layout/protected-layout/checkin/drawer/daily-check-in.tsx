import { Icon } from '@/components/ui/icon'
import { useAppSelector } from '@/hooks/redux'
import { useGetCheckInHistoryQuery } from '@/queries/daily-tasks/use-get-check-in-history-query'
import { checkInSelectors } from '@/store/slices/checkin'
import { getDayOfWeek } from '@/utils/get-day-of-week'
import { cn } from '@/utils/tw'

const daysInWeek = [
  {
    name: 'Mon'
  },
  {
    name: 'Tue'
  },
  {
    name: 'Wed'
  },
  {
    name: 'Thu'
  },
  {
    name: 'Fri'
  },
  {
    name: 'Sat'
  },
  {
    name: 'Sun'
  }
]

const DailyCheckIn = () => {
  const { data, isLoading } = useGetCheckInHistoryQuery()
  const history = data?.check_in_history || []

  const currentDayIndex = getDayOfWeek()
  const shouldRunAnimation = useAppSelector(checkInSelectors.shouldRunAnimation)

  return (
    <div className="mt-5 flex w-full items-center justify-between">
      {daysInWeek.map((item, index) => {
        const isChecked = history[index] === true
        const isPast = index < currentDayIndex
        const isToday = index === currentDayIndex

        return (
          <div key={index} className="flex flex-col items-center gap-2">
            <div className="bg-background/50 size-6 overflow-hidden rounded-full">
              {isChecked && (isToday || isPast) && (
                <div
                  className={cn(
                    'bg-primary/20 flex size-full items-center justify-center rounded-full',
                    shouldRunAnimation && isToday && 'animate-check-in opacity-0 delay-1000'
                  )}
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, rgba(246, 246, 85, 0.10) 0%, rgba(94, 237, 135, 0.10) 100%)'
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="9"
                    viewBox="0 0 12 9"
                    fill="none"
                  >
                    <path
                      d="M11.2143 1L4.33929 7.875L1.21429 4.75"
                      stroke="url(#paint0_linear_3629_16959)"
                      strokeWidth="1.125"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_3629_16959"
                        x1="1.21429"
                        y1="4.63582"
                        x2="11.2143"
                        y2="4.63582"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#F6F655" />
                        <stop offset="1" stopColor="#5EED87" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}

              {isPast && !isChecked && !isLoading && (
                <div className="bg-destructive/10 flex size-full items-center justify-center rounded-full">
                  <Icon className="text-destructive size-4" icon="X" />
                </div>
              )}
            </div>
            <p className={cn('text-14 leading-normal', isToday && 'font-medium')}>{item.name}</p>
          </div>
        )
      })}
    </div>
  )
}

export default DailyCheckIn
