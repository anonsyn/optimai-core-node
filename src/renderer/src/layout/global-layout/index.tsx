import { Outlet } from 'react-router'
import Header from './header'
import Sidebar from './sidebar'

const GlobalLayout = () => {
  return (
    <div className="bg-global grid h-screen w-screen grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] bg-white">
      <Header />
      <Sidebar />
      <div className="rounded-tl-24 size-full overflow-hidden bg-red-300">
        <Outlet />
      </div>
    </div>
  )
}

export default GlobalLayout
