import { Outlet } from 'react-router'
import Header from './header'
import NavigationBar from './navigation-bar'

const MainLayout = () => {
  return (
    <div className="flex size-full flex-col">
      <Header />
      <div className="w-full flex-1">
        <Outlet />
      </div>
      <NavigationBar />
    </div>
  )
}

export default MainLayout
