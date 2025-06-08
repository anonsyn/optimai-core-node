import NodeProvider from '@lite-node/layout/protected-layout/node/provider'
import SessionHandler from '@lite-node/layout/protected-layout/session'
import { LogoutConfirmationModal } from '@lite-node/modals/logout-confirmation-modal'
import OnBoardingModal from '@lite-node/modals/on-boarding-modal'
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
