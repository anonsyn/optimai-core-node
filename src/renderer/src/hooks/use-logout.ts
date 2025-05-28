import { useAppDispatch } from '@/hooks/redux'
import { useUserDeviceStore } from '@/hooks/use-user-deivce-store'
import { useUserUptimeRewardStore } from '@/hooks/use-user-last-uptime-reward-store'
import { useUserUptimeRewardCountStore } from '@/hooks/use-user-uptime-reward-count-store'
import { useUserUptimeStore } from '@/hooks/use-user-uptime-store'
import { PATHS } from '@/routers/paths'
import { authActions } from '@/store/slices/auth'
import { checkInActions } from '@/store/slices/checkin'
import { notificationActions } from '@/store/slices/notification'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

const useLogout = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const uptimeStore = useUserUptimeStore()
  const deviceStore = useUserDeviceStore()
  const uptimeRewardStore = useUserUptimeRewardStore()
  const uptimeRewardCountStore = useUserUptimeRewardCountStore()

  return async () => {
    try {
      await window.nodeIPC.stopNode()
      await window.authIPC.logout()
    } catch (error) {
      console.error(error)
    }

    dispatch(authActions.setUser(undefined))
    dispatch(checkInActions.reset())
    dispatch(notificationActions.reset())

    navigate(PATHS.LOGIN, { replace: true })

    queryClient.removeQueries()

    uptimeStore.removeData()
    deviceStore.removeData()
    uptimeRewardStore.removeData()
    uptimeRewardCountStore.removeData()
  }
}

export { useLogout }
