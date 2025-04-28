import TaskIconBackground from '@/components/svgs/task-icon-background'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useGetDailyTasksQuery } from '@/queries/daily-tasks'
import { checkInActions, checkInSelectors } from '@/store/slices/checkin'

const DailyTasks = () => {
  const { data: task, isLoading } = useGetDailyTasksQuery()

  const isCheckedIn = useAppSelector(checkInSelectors.alreadyCheckedIn)

  const dispatch = useAppDispatch()

  const handleOpenDailyCheckIn = () => {
    dispatch(checkInActions.openModal())
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-[1.625rem] w-4/5" />
        <Skeleton className="h-18 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h1 className="text-16 leading-26 font-medium text-white">Daily Tasks</h1>
      <div className="space-y-4">
        <button
          className="rounded-10 bg-raydial-05 grid min-h-18 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border border-[#737373]/20 px-3 py-2 transition-opacity hover:opacity-80"
          onClick={handleOpenDailyCheckIn}
        >
          <div className="relative flex size-12 items-center justify-center rounded-lg">
            <TaskIconBackground className="absolute inset-0 size-full" />
            <span className="block">
              <Icon icon="Calendar" />
            </span>
          </div>
          <div className="flex w-full flex-col items-start">
            <p className="text-16 line-clamp-1 text-start leading-normal font-medium">
              {task?.title}
            </p>
            <p className="text-14 leading-normal text-white opacity-50">{task?.description}</p>
          </div>
          {isCheckedIn && (
            <div className="bg-background relative flex size-8 items-center justify-center rounded-full">
              <Icon className="text-positive size-4.5" icon="Check" />
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

export default DailyTasks
