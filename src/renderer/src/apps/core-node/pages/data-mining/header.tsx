import Logo from '@/components/branding/logo'
import { WindowControlButton, WindowControls } from '@/components/modules/window-controls'
import { getOS, OS } from '@/utils/os'
import { motion } from 'framer-motion'

export const DataMiningHeader = () => {
  const os = getOS()
  const isMac = os === OS.MAC

  return (
    <div className="relative z-40 flex h-12 items-center justify-between border-b border-white/5">
      <div className="drag-region absolute inset-0" />

      {/* Logo - positioned after traffic lights on macOS */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="no-drag relative z-10 flex items-center"
        style={{
          paddingLeft: isMac ? '85px' : '20px' // Space for traffic lights on macOS
        }}
      >
        <Logo variant="horizontal" className="h-5 w-auto" />
      </motion.div>

      <WindowControls className="no-drag relative pr-4">
        <WindowControlButton variant="minimize" />
        <WindowControlButton variant="maximize" />
        <WindowControlButton variant="close" />
      </WindowControls>
    </div>
  )
}