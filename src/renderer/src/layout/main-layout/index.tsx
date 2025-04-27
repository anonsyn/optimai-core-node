import { Outlet } from 'react-router'
import Header from './header'

const MainLayout = () => {
  return (
    <div className="flex size-full flex-col">
      <Header />
      <div className="w-full flex-1">
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout
