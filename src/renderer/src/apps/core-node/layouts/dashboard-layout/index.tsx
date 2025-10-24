import { UpdateProvider } from '@/providers/update'
import UpdateReadyModal from '@core-node/modals/update-ready-modal'
import WindowsUpdateModal from '@core-node/modals/windows-update-modal'
import { Outlet } from 'react-router'

const DashboardLayout = () => {
  return (
    <UpdateProvider>
      <Outlet />
      <UpdateReadyModal />
      <WindowsUpdateModal />
    </UpdateProvider>
  )
}

export default DashboardLayout
