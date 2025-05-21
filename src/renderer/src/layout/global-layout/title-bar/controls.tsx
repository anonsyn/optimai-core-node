import {
  MacControlButton,
  WindowControls,
  WindowsControlButton
} from '@/components/modules/window-controls'
import { useOs } from '@/hooks/use-os'

const Controls = () => {
  const { os, isMac } = useOs()
  return (
    <WindowControls className={!isMac ? 'order-2' : ''} os={os}>
      {isMac ? (
        <>
          <MacControlButton variant="close" onClick={() => window.windowIPC.close()} />
          <MacControlButton variant="minimize" onClick={() => window.windowIPC.minimize()} />
          <MacControlButton variant="maximize" disabled />
        </>
      ) : (
        <WindowsControlButton variant="maximize" onClick={() => window.windowIPC.maximize()} />
      )}
    </WindowControls>
  )
}

export default Controls
