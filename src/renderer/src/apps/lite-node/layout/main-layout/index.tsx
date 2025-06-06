import { Outlet } from 'react-router'
import Header from './header'
import NavigationBar from './navigation-bar'

const MainLayout = () => {
  return (
    <div className="grid size-full grid-rows-[auto_minmax(0,1fr)_auto]">
      <Header />
      <div className="size-full">
        <Outlet />
      </div>
      <NavigationBar />
    </div>
  )
}

export default MainLayout
