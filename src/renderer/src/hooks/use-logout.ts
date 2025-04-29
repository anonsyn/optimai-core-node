import { useAppDispatch } from '@/hooks/redux'
import { PATHS } from '@/routers/paths'
import { authActions } from '@/store/slices/auth'
import { checkInActions } from '@/store/slices/checkin'
import { notificationActions } from '@/store/slices/notification'
import { sessionManager } from '@/utils/session-manager'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

const useLogout = () => {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return () => {
    dispatch(authActions.setUser(undefined))
    dispatch(checkInActions.reset())
    dispatch(notificationActions.reset())

    navigate(PATHS.LOGIN, { replace: true })

    sessionManager.removeTokens()
    queryClient.removeQueries()
  }
}

export { useLogout }
