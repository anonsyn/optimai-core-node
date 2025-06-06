import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { checkInActions, checkInSelectors } from '@/store/slices/checkin'
import DailyCheckIn from './daily-check-in'
import Header from './header'
import WeeklyReward from './weekly-reward'

const CheckInDrawer = () => {
  const open = useAppSelector(checkInSelectors.showModal)

  const dispatch = useAppDispatch()

  const handleCloseDrawer = () => {
    dispatch(checkInActions.setShouldRunAnimation(false))
    dispatch(checkInActions.setAlreadyCheckIn(true))
    dispatch(checkInActions.closeModal())
  }

  return (
    <Drawer open={open} onOpenChange={handleCloseDrawer}>
      <DrawerContent>
        <div className="overflow-y-scroll">
          <div>
            <div className="px-4 pt-3">
              <Header />
              <DailyCheckIn />
            </div>
            <Separator className="my-6" />
            <WeeklyReward />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default CheckInDrawer
