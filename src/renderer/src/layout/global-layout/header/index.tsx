import Logo from '@/components/branding/logo'
import { PATHS } from '@/routers/paths'
import { useLocation } from 'react-router'
import Balance from './balance'
import BrowserTitleBar from './brower-title-bar'
import Controls from './controls'
const Header = () => {
  const { pathname } = useLocation()

  const isBrowserTab = pathname === PATHS.BROWSER

  return (
    <header className="col-span-2 flex size-full h-20 items-center gap-8 px-5">
      <div className="flex-1">
        {isBrowserTab ? (
          <BrowserTitleBar />
        ) : (
          <Logo className="pointer-events-none h-9 w-auto select-none" />
        )}
      </div>
      <Balance />
      <Controls />
    </header>
  )
}

export default Header
