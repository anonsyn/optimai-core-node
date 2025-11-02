import { Outlet } from 'react-router'

const ProtectedRoute = () => {
  // const isSignedIn = useAppSelector(authSelectors.isSignedIn)

  // // if (!isSignedIn) {
  // //   return <Navigate to={PATHS.START_UP} />
  // // }
  return <Outlet />
}

export default ProtectedRoute
