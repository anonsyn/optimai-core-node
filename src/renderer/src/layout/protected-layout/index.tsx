import { LogoutConfirmationModal } from '@/modals/logout-confirmation-modal'
import { Outlet } from 'react-router'
import CheckInProvider from './checkin/provider'

const ProtectedLayout = () => {
  return (
    <CheckInProvider>
      <Outlet />
      <LogoutConfirmationModal />
    </CheckInProvider>
  )
}

export default ProtectedLayout
