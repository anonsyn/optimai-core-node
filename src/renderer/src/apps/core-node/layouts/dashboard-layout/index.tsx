import { Outlet } from 'react-router'
import Sidebar from './sidebar'
import TitleBar from './title-bar'

const DashboardLayout = () => {
  return (
    <div className="size-full">
      <div className="grid size-full grid-cols-1 grid-rows-[5rem_minmax(0,1fr)]">
        <div className="size-full">
          <TitleBar />
        </div>
        <div className="grid size-full grid-cols-[4.5rem_minmax(0,1fr)]">
          <div className="size-full">
            <Sidebar />
          </div>
          <div className="size-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
