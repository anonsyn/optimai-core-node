import { LogoutConfirmationModal } from '@/modals/logout-confirmation-modal'
import OnBoardingModal from '@/modals/on-boarding-modal'
import { Outlet } from 'react-router'
import CheckInProvider from './checkin/provider'

const ProtectedLayout = () => {
  return (
    <CheckInProvider>
      <Outlet />
      <LogoutConfirmationModal />
      <OnBoardingModal />
    </CheckInProvider>
  )
}

export default ProtectedLayout
