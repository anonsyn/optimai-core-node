import { useAppSelector } from '@/hooks/redux'
import { useCheckIn } from '@/hooks/use-check-in'
import { useHasClaimedWeeklyRewardQuery } from '@/queries/daily-tasks'
import { authSelectors } from '@/store/slices/auth'
import { sleep } from '@/utils/sleep'
import { PropsWithChildren, useEffect } from 'react'
import CheckInDrawer from './drawer'

const CheckInProvider = ({ children }: PropsWithChildren) => {
  const isSignedIn = useAppSelector(authSelectors.isSignedIn)

  const performCheckIn = useCheckIn()

  useHasClaimedWeeklyRewardQuery({ enabled: isSignedIn })

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
