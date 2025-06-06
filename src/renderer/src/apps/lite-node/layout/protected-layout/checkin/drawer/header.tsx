import { DrawerCloseButton, DrawerDescription, DrawerTitle } from '@/components/ui/drawer'
import { useGetDailyTasksQuery } from '@/queries/daily-tasks/use-get-daily-tasks-query'
import { compactNumber } from '@/utils/compact-number'

const Header = () => {
  const { data: task } = useGetDailyTasksQuery()

  return (
    <div className="flex items-center justify-between">
      <div>
        <DrawerTitle className="text-16 leading-relaxed font-medium text-white">
          Daily Reward
        </DrawerTitle>
        <DrawerDescription className="text-14 leading-relaxed text-white/50">
          Earn{' '}
          {compactNumber(task?.reward || 0, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          })}{' '}
          OPI for each day
        </DrawerDescription>
      </div>
      <DrawerCloseButton />
    </div>
  )
}

export default Header
