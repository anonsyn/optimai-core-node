import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useHasClaimedWeeklyRewardQuery } from '@/queries/daily-tasks'
import { dailyTaskService } from '@/services/daily-tasks'
import { authSelectors } from '@/store/slices/auth'
import { checkInActions } from '@/store/slices/checkin'
import { sleep } from '@/utils/sleep'
import { PropsWithChildren, useCallback, useEffect } from 'react'
import CheckInDrawer from './drawer'

const CheckInProvider = ({ children }: PropsWithChildren) => {
  const isSignedIn = useAppSelector(authSelectors.isSignedIn)

  const dispatch = useAppDispatch()

  const performCheckIn = useCallback(async () => {
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
  }, [dispatch])

  useHasClaimedWeeklyRewardQuery({ enabled: isSignedIn })

  console.log({ isSignedIn })

  useEffect(() => {
    let interval: any
    const startCheckin = async () => {
      if (isSignedIn) {
        await sleep(5000)
        performCheckIn()
        interval = setInterval(performCheckIn, 1000 * 60 * 60)
      }
    }
    startCheckin()

    return () => clearInterval(interval)
  }, [isSignedIn, performCheckIn])

  return (
    <>
      {children}
      {isSignedIn && <CheckInDrawer />}
    </>
  )
}

export default CheckInProvider
