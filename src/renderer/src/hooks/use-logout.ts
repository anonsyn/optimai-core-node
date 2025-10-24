import { authApi } from '@/api/auth'
import { useAppDispatch } from '@/hooks/redux'
import { sessionManager } from '@/utils/session-manager'
import { authActions } from '@/store/slices/auth'
import { PATHS } from '@core-node/routers/paths'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

const useLogout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

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
  }
}

export { useLogout }
