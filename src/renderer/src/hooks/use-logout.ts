import { useAppDispatch } from '@/hooks/redux'
import { logoutThunk } from '@/store/thunks/auth'

const useLogout = () => {
  const dispatch = useAppDispatch()
  // const navigate = useNavigate()

  return async () => {
    await dispatch(logoutThunk())
    // navigate(PATHS.START_UP, { replace: true })
  }
}

export { useLogout }
