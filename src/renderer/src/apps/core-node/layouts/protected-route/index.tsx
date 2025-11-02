import { useAppSelector } from '@/hooks/redux'
import { authSelectors } from '@/store/slices/auth'
import { PATHS } from '@core-node/routers/paths'
import { Navigate, Outlet } from 'react-router'

const ProtectedRoute = () => {
  const isSignedIn = useAppSelector(authSelectors.isSignedIn)

  if (!isSignedIn) {
    return <Navigate to={PATHS.START_UP} />
  }
  return <Outlet />
}

export default ProtectedRoute
