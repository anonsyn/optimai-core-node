import { LogoutConfirmationModal } from '@/modals/logout-confirmation-modal'
import { Outlet } from 'react-router'

const ProtectedLayout = () => {
  return (
    <>
      <Outlet />
      <LogoutConfirmationModal />
    </>
  )
}

export default ProtectedLayout
