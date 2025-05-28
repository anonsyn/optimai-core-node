import NodeProvider from '@/layout/protected-layout/node/provider'
import SessionHandler from '@/layout/protected-layout/session'
import { LogoutConfirmationModal } from '@/modals/logout-confirmation-modal'
import OnBoardingModal from '@/modals/on-boarding-modal'
import { Outlet } from 'react-router'
import CheckInProvider from './checkin/provider'

const ProtectedLayout = () => {
  return (
    <CheckInProvider>
      <NodeProvider />
      <SessionHandler />
      <Outlet />
      <LogoutConfirmationModal />
      <OnBoardingModal />
    </CheckInProvider>
  )
}

export default ProtectedLayout
