import { Outlet } from 'react-router'
import Header from './header'
import Sidebar from './sidebar'

const GlobalLayout = () => {
  return (
    <div className="w-screen h-screen grid grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)]">
      <Header />
      <Sidebar />
      <div className="bg-red-500 size-full">
        <Outlet />
      </div>
    </div>
  )
}

export default GlobalLayout
