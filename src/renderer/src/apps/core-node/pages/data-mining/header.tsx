import Logo from '@/components/branding/logo'
import { WindowControlButton, WindowControls } from '@/components/modules/window-controls'
import { getOS, OS } from '@/utils/os'
import { motion } from 'framer-motion'
import packageJson from '../../../../../../../package.json'
import { NodeStatusIndicator } from './node-status-indicator'
import { WalletPopover } from './wallet-popover'

export const DataMiningHeader = () => {
  const os = getOS()
  const isMac = os === OS.MAC

  return (
    <div className="relative z-[51] flex h-16 shrink-0 items-center justify-between border-b border-white/5">
      <div className="drag-region absolute inset-0" />

      {/* Logo - positioned after traffic lights on macOS */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center gap-2"
        style={{
          paddingLeft: isMac ? '85px' : '20px' // Space for traffic lights on macOS
        }}
      >
        <Logo variant="horizontal" className="h-6 w-auto" />
        <span className="text-12 self-end font-mono text-white/50">v{packageJson.version}</span>
      </motion.div>

      <div className="no-drag relative z-10 flex items-center gap-2 pr-4">
        <NodeStatusIndicator />
        <WalletPopover />
        <WindowControls className="!static flex items-center pl-6">
          <WindowControlButton variant="minimize" />
          {/* <WindowControlButton variant="maximize" disabled /> */}
          <WindowControlButton variant="close" />
        </WindowControls>
      </div>
    </div>
  )
}
