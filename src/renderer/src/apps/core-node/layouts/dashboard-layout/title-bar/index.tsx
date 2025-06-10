import Logo from '@/components/branding/logo'
import {
  MacControlButton,
  MacControls,
  WindowsControlButton,
  WindowsControls
} from '@/components/modules/window-controls'
import { useOs } from '@/hooks/use-os'
import AccountBalance from './account-balance'

const TitleBar = () => {
  const { isMac } = useOs()

  return (
    <header className="drag-region flex size-full items-center justify-between px-5 py-4">
      <div className="flex items-center gap-8">
        {isMac && (
          <MacControls>
            <MacControlButton variant="close" onClick={() => window.windowIPC.close()} />
            <MacControlButton variant="minimize" onClick={() => window.windowIPC.minimize()} />
            <MacControlButton variant="maximize" disabled />
          </MacControls>
        )}
        <Logo className="h-7" variant="horizontal" />
      </div>
      <div>
        <AccountBalance />
        {!isMac && (
          <WindowsControls>
            <WindowsControlButton variant="close" onClick={() => window.windowIPC.close()} />
            <WindowsControlButton variant="minimize" onClick={() => window.windowIPC.minimize()} />
            <WindowsControlButton variant="maximize" disabled />
          </WindowsControls>
        )}
      </div>
    </header>
  )
}

export default TitleBar
