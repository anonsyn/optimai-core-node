import { useAppDispatch } from '@/hooks/redux'
import { dailyTaskService } from '@/services/daily-tasks'
import { checkInActions } from '@/store/slices/checkin'

export const useCheckIn = () => {
  const dispatch = useAppDispatch()

  return async () => {
    try {
      const res = await dailyTaskService.checkIn()
      const { already_checked_in, reward } = res.data
      if (!already_checked_in) {
        dispatch(checkInActions.setShouldRunAnimation(true))
        dispatch(checkInActions.openModal())
      }
      dispatch(checkInActions.setAlreadyCheckIn(already_checked_in))
      dispatch(checkInActions.setDailyCheckInReward(reward))
    } catch (error) {
      console.error('Failed to perform check-in:', error)
    }
  }
}
