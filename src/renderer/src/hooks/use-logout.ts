import { authApi } from '@/api/auth'
import { useAppDispatch } from '@/hooks/redux'
import { useUserDeviceStore } from '@/hooks/use-user-deivce-store'
import { useUserUptimeRewardStore } from '@/hooks/use-user-last-uptime-reward-store'
import { useUserUptimeRewardCountStore } from '@/hooks/use-user-uptime-reward-count-store'
import { useUserUptimeStore } from '@/hooks/use-user-uptime-store'
import { sessionManager } from '@/utils/session-manager'
import { authActions } from '@/store/slices/auth'
import { PATHS } from '@core-node/routers/paths'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

const useLogout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const uptimeStore = useUserUptimeStore()
  const deviceStore = useUserDeviceStore()
  const uptimeRewardStore = useUserUptimeRewardStore()
  const uptimeRewardCountStore = useUserUptimeRewardCountStore()

  return async () => {
    try {
      await window.nodeIPC.stopNode()
    } catch (error) {
      console.error(error)
    }

    try {
      await authApi.signOut()
    } catch (error) {
      console.error('Failed to sign out via API:', error)
    }

    await sessionManager.clearTokens().catch((error) => {
      console.error('Failed to clear tokens:', error)
    })

    dispatch(authActions.setUser(undefined))

    navigate(PATHS.START_UP, { replace: true })

    queryClient.removeQueries()

    uptimeStore.removeData()
    deviceStore.removeData()
    uptimeRewardStore.removeData()
    uptimeRewardCountStore.removeData()
  }
}

export { useLogout }
