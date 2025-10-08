import { UpdateProvider } from '@/providers/update'
import UpdateReadyModal from '@core-node/modals/update-ready-modal'
import { Outlet } from 'react-router'

const DashboardLayout = () => {
  return (
    <UpdateProvider>
      <Outlet />
      <UpdateReadyModal />
    </UpdateProvider>
  )
}

export default DashboardLayout
